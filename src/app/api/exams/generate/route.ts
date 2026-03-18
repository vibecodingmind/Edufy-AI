import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import ZAI from 'z-ai-web-dev-sdk';

interface GeneratedQuestion {
  questionText: string;
  questionType: string;
  difficulty: string;
  marks: number;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  section: string;
}

interface GeneratedExam {
  title: string;
  instructions: string;
  sections: {
    section: string;
    name: string;
    totalMarks: number;
    questions: GeneratedQuestion[];
  }[];
  markingScheme: {
    questionNumber: string;
    answer: string;
    marks: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      classLevelId,
      subjectId,
      topicId,
      examType,
      totalMarks,
      duration,
      difficultyMix,
    } = body;
    
    // Get related data
    const [classLevel, subject, topic] = await Promise.all([
      db.classLevel.findUnique({ where: { id: classLevelId } }),
      db.subject.findUnique({ where: { id: subjectId } }),
      topicId ? db.topic.findUnique({ where: { id: topicId } }) : null,
    ]);
    
    if (!classLevel || !subject) {
      return NextResponse.json(
        { error: 'Invalid class level or subject' },
        { status: 400 }
      );
    }
    
    // Get existing questions from the database for reference
    const existingQuestions = await db.question.findMany({
      where: {
        subjectId,
        classLevelId,
        ...(topicId && { topicId }),
      },
      take: 10,
    });
    
    // Build the AI prompt
    const prompt = buildExamPrompt({
      classLevel: classLevel.name,
      subject: subject.name,
      topic: topic?.name,
      examType: examType || 'Midterm',
      totalMarks: totalMarks || 50,
      duration: duration || 60,
      difficultyMix: difficultyMix || 'balanced',
      existingQuestions,
    });
    
    // Generate exam using AI
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are an expert exam creator for primary and secondary school education. You create well-structured, curriculum-aligned exams with proper marking schemes. Always respond with valid JSON only, no additional text.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      thinking: { type: 'disabled' },
    });
    
    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      return NextResponse.json(
        { error: 'Failed to generate exam' },
        { status: 500 }
      );
    }
    
    // Parse the AI response
    let generatedExam: GeneratedExam;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanResponse = responseText.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.slice(7);
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.slice(3);
      }
      if (cleanResponse.endsWith('```')) {
        cleanResponse = cleanResponse.slice(0, -3);
      }
      
      generatedExam = JSON.parse(cleanResponse.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse generated exam' },
        { status: 500 }
      );
    }
    
    // Create the exam in the database
    const exam = await db.exam.create({
      data: {
        title: generatedExam.title || `${subject.name} - ${classLevel.name} ${examType || 'Midterm'} Exam`,
        examType: examType || 'Midterm',
        totalMarks: totalMarks || 50,
        duration: duration || 60,
        instructions: generatedExam.instructions || 'Answer all questions. Write clearly and legibly.',
        status: 'generated',
        userId: session.userId,
        subjectId,
        classLevelId,
      },
    });
    
    // Create questions and link them to the exam
    let questionNumber = 1;
    for (const section of generatedExam.sections || []) {
      for (const q of section.questions || []) {
        // Create the question
        const question = await db.question.create({
          data: {
            questionText: q.questionText,
            questionType: q.questionType,
            difficulty: q.difficulty || 'medium',
            marks: q.marks,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            subjectId,
            classLevelId,
            topicId,
          },
        });
        
        // Link to exam
        await db.examQuestion.create({
          data: {
            examId: exam.id,
            questionId: question.id,
            section: section.section,
            questionNum: questionNumber,
            marks: q.marks,
          },
        });
        
        questionNumber++;
      }
    }
    
    // Fetch the complete exam with questions
    const completeExam = await db.exam.findUnique({
      where: { id: exam.id },
      include: {
        examQuestions: {
          include: {
            question: true,
          },
          orderBy: [{ section: 'asc' }, { questionNum: 'asc' }],
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      exam: completeExam,
      markingScheme: generatedExam.markingScheme,
    });
  } catch (error) {
    console.error('Error generating exam:', error);
    return NextResponse.json(
      { error: 'Failed to generate exam' },
      { status: 500 }
    );
  }
}

function buildExamPrompt(params: {
  classLevel: string;
  subject: string;
  topic?: string | null;
  examType: string;
  totalMarks: number;
  duration: number;
  difficultyMix: string;
  existingQuestions: Array<{
    questionText: string;
    questionType: string;
    difficulty: string;
    marks: number;
  }>;
}): string {
  const { classLevel, subject, topic, examType, totalMarks, difficultyMix, existingQuestions } = params;
  
  let difficultyInstructions = '';
  switch (difficultyMix) {
    case 'easy':
      difficultyInstructions = 'Focus primarily on easy questions (60% easy, 30% medium, 10% hard).';
      break;
    case 'hard':
      difficultyInstructions = 'Focus primarily on challenging questions (20% easy, 30% medium, 50% hard).';
      break;
    default:
      difficultyInstructions = 'Use a balanced mix of difficulties (30% easy, 40% medium, 30% hard).';
  }
  
  const topicInstruction = topic
    ? `The exam should focus on the topic: "${topic}".`
    : `The exam should cover various topics from the ${subject} curriculum.`;
  
  const exampleQuestions = existingQuestions.length > 0
    ? `\n\nHere are some example questions for reference:\n${existingQuestions.map(q => `- ${q.questionText} (${q.questionType}, ${q.marks} marks)`).join('\n')}`
    : '';
  
  return `Generate a ${classLevel} ${subject} ${examType} exam.
${topicInstruction}

Requirements:
- Total marks: ${totalMarks}
- Duration: ${params.duration} minutes
- ${difficultyInstructions}
- Follow the national school exam format

The exam must have exactly 4 sections:
- Section A: Multiple Choice Questions (MCQ)
- Section B: Short Answer Questions
- Section C: Structured Questions
- Section D: Essay Questions

Each section should have appropriate questions that match the ${classLevel} curriculum level.
${exampleQuestions}

Respond with a JSON object in this exact format:
{
  "title": "Exam title",
  "instructions": "General instructions for students",
  "sections": [
    {
      "section": "A",
      "name": "Multiple Choice Questions",
      "totalMarks": 10,
      "questions": [
        {
          "questionText": "Question text here?",
          "questionType": "MCQ",
          "difficulty": "easy",
          "marks": 1,
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Brief explanation"
        }
      ]
    },
    {
      "section": "B",
      "name": "Short Answer Questions",
      "totalMarks": 15,
      "questions": [
        {
          "questionText": "Question text",
          "questionType": "short_answer",
          "difficulty": "medium",
          "marks": 3,
          "correctAnswer": "Expected answer",
          "explanation": "Brief explanation"
        }
      ]
    },
    {
      "section": "C",
      "name": "Structured Questions",
      "totalMarks": 15,
      "questions": [
        {
          "questionText": "Question text with multiple parts",
          "questionType": "structured",
          "difficulty": "medium",
          "marks": 5,
          "correctAnswer": "Expected answer with parts",
          "explanation": "Brief explanation"
        }
      ]
    },
    {
      "section": "D",
      "name": "Essay Questions",
      "totalMarks": 10,
      "questions": [
        {
          "questionText": "Essay question text",
          "questionType": "essay",
          "difficulty": "hard",
          "marks": 10,
          "correctAnswer": "Key points that should be covered",
          "explanation": "Marking guidelines"
        }
      ]
    }
  ],
  "markingScheme": [
    {
      "questionNumber": "1",
      "answer": "Correct answer",
      "marks": 1
    }
  ]
}

Make sure the total marks across all sections equals ${totalMarks}.
Generate real, curriculum-appropriate questions. Do not use placeholder text.`;
}
