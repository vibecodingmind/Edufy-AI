import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';
import * as XLSX from 'xlsx';

// POST - Export questions or exam to Excel
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { examId, questionIds, subjectId, classLevelId } = await request.json();

    let questions: any[] = [];

    if (examId) {
      // Export exam questions
      const exam = await db.exam.findUnique({
        where: { id: examId },
        include: {
          examQuestions: {
            include: {
              question: {
                include: { subject: true, topic: true },
              },
            },
            orderBy: { questionNum: 'asc' },
          },
        },
      });

      if (!exam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }

      questions = exam.examQuestions.map(eq => ({
        section: eq.section,
        questionNum: eq.questionNum,
        questionText: eq.question.questionText,
        questionType: eq.question.questionType,
        difficulty: eq.question.difficulty,
        marks: eq.marks,
        options: eq.question.options,
        correctAnswer: eq.question.correctAnswer,
        explanation: eq.question.explanation,
        subject: eq.question.subject?.name,
        topic: eq.question.topic?.name,
      }));

    } else if (questionIds) {
      // Export specific questions
      const fetchedQuestions = await db.question.findMany({
        where: { id: { in: questionIds } },
        include: { subject: true, topic: true },
      });

      questions = fetchedQuestions.map(q => ({
        questionText: q.questionText,
        questionType: q.questionType,
        difficulty: q.difficulty,
        marks: q.marks,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subject: q.subject?.name,
        topic: q.topic?.name,
      }));

    } else if (subjectId || classLevelId) {
      // Export by filter
      const where: any = {};
      if (subjectId) where.subjectId = subjectId;
      if (classLevelId) where.classLevelId = classLevelId;

      const fetchedQuestions = await db.question.findMany({
        where,
        include: { subject: true, topic: true },
      });

      questions = fetchedQuestions.map(q => ({
        questionText: q.questionText,
        questionType: q.questionType,
        difficulty: q.difficulty,
        marks: q.marks,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subject: q.subject?.name,
        topic: q.topic?.name,
      }));
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions to export' }, { status: 400 });
    }

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(questions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="educ-export-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json({ error: 'Failed to export to Excel' }, { status: 500 });
  }
}
