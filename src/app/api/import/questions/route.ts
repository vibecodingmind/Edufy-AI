import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// POST - Import questions from CSV/Excel
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subjectId = formData.get('subjectId') as string;
    const classLevelId = formData.get('classLevelId') as string;
    const topicId = formData.get('topicId') as string;

    if (!file || !subjectId || !classLevelId) {
      return NextResponse.json({ error: 'File, subject, and class level required' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    
    let questions: any[] = [];

    if (fileName.endsWith('.csv')) {
      // Parse CSV
      const text = new TextDecoder().decode(buffer);
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      
      questions = result.data.map((row: any) => ({
        questionText: row.questionText || row.question || row.Question,
        questionType: row.questionType || row.type || row.Type || 'short_answer',
        difficulty: row.difficulty || row.Difficulty || 'medium',
        marks: parseInt(row.marks || row.Marks || '5'),
        options: row.options || row.Options || null,
        correctAnswer: row.correctAnswer || row.answer || row.Answer || '',
        explanation: row.explanation || row.Explanation || null,
        tags: row.tags || row.Tags || null,
      })).filter(q => q.questionText && q.correctAnswer);

    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Parse Excel
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      questions = data.map((row: any) => ({
        questionText: row.questionText || row.question || row.Question,
        questionType: row.questionType || row.type || row.Type || 'short_answer',
        difficulty: row.difficulty || row.Difficulty || 'medium',
        marks: parseInt(row.marks || row.Marks || '5'),
        options: row.options || row.Options || null,
        correctAnswer: row.correctAnswer || row.answer || row.Answer || '',
        explanation: row.explanation || row.Explanation || null,
        tags: row.tags || row.Tags || null,
      })).filter(q => q.questionText && q.correctAnswer);
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No valid questions found in file' }, { status: 400 });
    }

    // Create questions
    const createdQuestions = await Promise.all(
      questions.map(q => 
        db.question.create({
          data: {
            questionText: q.questionText,
            questionType: q.questionType.toLowerCase().includes('mcq') ? 'MCQ' : 
                          q.questionType.toLowerCase().includes('essay') ? 'essay' : 'short_answer',
            difficulty: q.difficulty.toLowerCase(),
            marks: q.marks,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            tags: q.tags,
            sourceType: 'manual',
            subjectId,
            classLevelId,
            topicId: topicId || null,
          },
        })
      )
    );

    // Log activity
    await db.activity.create({
      data: {
        userId: (user as any).id,
        type: 'questions_imported',
        title: 'Questions Imported',
        description: `Imported ${createdQuestions.length} questions from ${file.name}`,
        metadata: JSON.stringify({ count: createdQuestions.length, fileName: file.name }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      imported: createdQuestions.length,
      questions: createdQuestions,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import questions' }, { status: 500 });
  }
}
