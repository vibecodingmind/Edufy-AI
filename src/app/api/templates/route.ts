import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';

// GET - Get exam templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subjectId = searchParams.get('subjectId');
    const classLevelId = searchParams.get('classLevelId');

    const where: any = { isPublic: true };
    
    if (category) where.category = category;
    if (subjectId) where.subjectId = subjectId;
    if (classLevelId) where.classLevelId = classLevelId;

    const templates = await db.examTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 50,
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST - Create template from exam
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { examId, name, description, isPublic } = await request.json();

    if (!examId || !name) {
      return NextResponse.json({ error: 'Exam ID and name required' }, { status: 400 });
    }

    // Get exam with questions
    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: {
        examQuestions: {
          include: {
            question: true,
          },
          orderBy: { questionNum: 'asc' },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Create sections config
    const sectionMap = new Map<string, any[]>();
    exam.examQuestions.forEach(eq => {
      if (!sectionMap.has(eq.section)) {
        sectionMap.set(eq.section, []);
      }
      sectionMap.get(eq.section)!.push({
        questionType: eq.question.questionType,
        marks: eq.marks,
      });
    });

    const sections = Array.from(sectionMap.entries()).map(([label, questions]) => ({
      label,
      count: questions.length,
      totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
      questionTypes: [...new Set(questions.map(q => q.questionType))],
    }));

    const template = await db.examTemplate.create({
      data: {
        name,
        description,
        category: exam.examType,
        subjectId: exam.subjectId,
        classLevelId: exam.classLevelId,
        totalMarks: exam.totalMarks,
        duration: exam.duration,
        instructions: exam.instructions,
        sections: JSON.stringify(sections),
        isPublic: isPublic || false,
        createdBy: (user as any).id,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
