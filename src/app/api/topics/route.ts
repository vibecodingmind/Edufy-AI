import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const classLevelId = searchParams.get('classLevelId');
    
    const where: { subjectId?: string; classLevelId?: string } = {};
    
    if (subjectId) where.subjectId = subjectId;
    if (classLevelId) where.classLevelId = classLevelId;
    
    const topics = await db.topic.findMany({
      where,
      include: {
        subtopics: true,
      },
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
