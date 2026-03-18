import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const classLevelId = searchParams.get('classLevelId');
    const topicId = searchParams.get('topicId');
    const questionType = searchParams.get('questionType');
    const difficulty = searchParams.get('difficulty');
    
    const where: Record<string, string | undefined> = {};
    
    if (subjectId) where.subjectId = subjectId;
    if (classLevelId) where.classLevelId = classLevelId;
    if (topicId) where.topicId = topicId;
    if (questionType) where.questionType = questionType;
    if (difficulty) where.difficulty = difficulty;
    
    const questions = await db.question.findMany({
      where,
      include: {
        subject: true,
        classLevel: true,
        topic: true,
        subtopic: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
