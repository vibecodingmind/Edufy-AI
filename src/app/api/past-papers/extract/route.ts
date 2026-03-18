import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import ZAI from 'z-ai-web-dev-sdk';

const execAsync = promisify(exec);

interface ExtractedQuestion {
  questionText: string;
  questionType: string;
  difficulty: string;
  marks: number;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  section?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { pastPaperId } = await request.json();
    
    if (!pastPaperId) {
      return NextResponse.json({ error: 'pastPaperId required' }, { status: 400 });
    }
    
    // Get the past paper
    const pastPaper = await db.pastPaper.findUnique({
      where: { id: pastPaperId },
      include: {
        subject: true,
        classLevel: true,
      },
    });
    
    if (!pastPaper) {
      return NextResponse.json({ error: 'Past paper not found' }, { status: 404 });
    }
    
    // Update status to processing
    await db.pastPaper.update({
      where: { id: pastPaperId },
      data: { extractionStatus: 'processing' },
    });
    
    let extractedText = '';
    
    // Extract text based on file type
    if (pastPaper.fileType === 'pdf') {
      extractedText = await extractTextFromPDF(pastPaper.filePath);
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(pastPaper.fileType)) {
      extractedText = await extractTextFromImage(pastPaper.filePath);
    } else if (pastPaper.fileType === 'docx') {
      extractedText = await extractTextFromDocx(pastPaper.filePath);
    } else {
      await db.pastPaper.update({
        where: { id: pastPaperId },
        data: { extractionStatus: 'failed' },
      });
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }
    
    if (!extractedText || extractedText.trim().length < 50) {
      await db.pastPaper.update({
        where: { id: pastPaperId },
        data: { extractionStatus: 'failed' },
      });
      return NextResponse.json({ error: 'Could not extract sufficient text from document' }, { status: 400 });
    }
    
    // Use AI to parse and structure questions
    const questions = await parseQuestionsWithAI(extractedText, {
      subject: pastPaper.subject.name,
      classLevel: pastPaper.classLevel.name,
      year: pastPaper.year,
      examType: pastPaper.examType,
      title: pastPaper.title,
    });
    
    // Save questions to database
    let savedCount = 0;
    for (const q of questions) {
      try {
        await db.question.create({
          data: {
            questionText: q.questionText,
            questionType: q.questionType,
            difficulty: q.difficulty,
            marks: q.marks,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            year: pastPaper.year,
            sourceExam: pastPaper.title,
            sourceType: 'past_paper',
            sourceId: pastPaperId,
            subjectId: pastPaper.subjectId,
            classLevelId: pastPaper.classLevelId,
          },
        });
        savedCount++;
      } catch (e) {
        console.error('Failed to save question:', e);
      }
    }
    
    // Update past paper status
    await db.pastPaper.update({
      where: { id: pastPaperId },
      data: {
        extractionStatus: 'completed',
        extractedCount: savedCount,
      },
    });
    
    return NextResponse.json({
      success: true,
      extractedCount: savedCount,
      totalFound: questions.length,
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({ 
      error: 'Failed to extract questions' 
    }, { status: 500 });
  }
}

async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Use pdftotext command-line tool
    const { stdout } = await execAsync(`pdftotext -layout "${filePath}" -`);
    return stdout;
  } catch (error) {
    console.error('PDF extraction error:', error);
    // Fallback to pdfplumber via Python
    try {
      const pythonScript = `
import pdfplumber
import sys

try:
    with pdfplumber.open("${filePath}") as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
            text += "\\n\\n"
        print(text)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
`;
      const { stdout } = await execAsync(`python3 -c '${pythonScript.replace(/'/g, "'\\''")}'`);
      return stdout;
    } catch (e) {
      console.error('pdfplumber extraction failed:', e);
      return '';
    }
  }
}

async function extractTextFromImage(filePath: string): Promise<string> {
  try {
    // Use VLM for image understanding
    const imageBuffer = await readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = filePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    const zai = await ZAI.create();
    
    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text from this exam paper image. Preserve the structure including question numbers, marks, and sections. Only output the extracted text, no commentary.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ] as any,
      thinking: { type: 'disabled' }
    });
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Image extraction error:', error);
    return '';
  }
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    // Use python-docx
    const pythonScript = `
from docx import Document
import sys

try:
    doc = Document("${filePath}")
    text = "\\n".join([p.text for p in doc.paragraphs])
    print(text)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
`;
    const { stdout } = await execAsync(`python3 -c '${pythonScript.replace(/'/g, "'\\''")}'`);
    return stdout;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return '';
  }
}

async function parseQuestionsWithAI(
  text: string, 
  context: { subject: string; classLevel: string; year: number; examType: string; title: string }
): Promise<ExtractedQuestion[]> {
  const zai = await ZAI.create();
  
  const prompt = `You are an expert at analyzing exam papers and extracting questions. 

Analyze the following exam text from a ${context.classLevel} ${context.subject} ${context.examType} exam (${context.year}).

Extract ALL questions from the text and format them as a JSON array. Each question should have:
- questionText: The full question text
- questionType: One of "MCQ", "short_answer", "structured", or "essay"
- difficulty: One of "easy", "medium", or "hard" (estimate based on complexity)
- marks: The mark value (estimate if not shown)
- options: For MCQ only, array of option strings
- correctAnswer: The expected answer or "Not provided" if not in text
- explanation: Optional explanation or marking guide if available
- section: Section letter if applicable (A, B, C, D)

Exam text:
---
${text.substring(0, 8000)}
---

Respond ONLY with a valid JSON array of questions. No additional text or commentary.
If the text doesn't contain exam questions, return an empty array [].

Example format:
[
  {
    "questionText": "What is the capital of France?",
    "questionType": "MCQ",
    "difficulty": "easy",
    "marks": 1,
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "correctAnswer": "Paris",
    "section": "A"
  }
]`;

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: 'You are an expert exam analyzer. You extract questions from exam papers and format them as structured JSON. You respond ONLY with valid JSON arrays, no additional text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    thinking: { type: 'disabled' }
  });

  const responseText = completion.choices[0]?.message?.content;
  
  if (!responseText) {
    return [];
  }
  
  try {
    // Clean response
    let cleanResponse = responseText.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.slice(7);
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.slice(3);
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.slice(0, -3);
    }
    
    return JSON.parse(cleanResponse.trim());
  } catch (e) {
    console.error('Failed to parse AI response:', responseText.substring(0, 500));
    return [];
  }
}
