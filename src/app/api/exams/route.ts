import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET - List all exams for the current user
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const exams = await db.exam.findMany({
      where: { userId: session.userId },
      include: {
        examQuestions: {
          include: {
            question: {
              include: {
                subject: true,
                classLevel: true,
                topic: true,
              },
            },
          },
          orderBy: [{ section: 'asc' }, { questionNum: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an exam
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Exam ID required' }, { status: 400 });
    }
    
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify ownership
    const exam = await db.exam.findUnique({
      where: { id },
    });
    
    if (!exam || exam.userId !== session.userId) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    
    // Delete exam questions first
    await db.examQuestion.deleteMany({
      where: { examId: id },
    });
    
    // Delete exam
    await db.exam.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json(
      { error: 'Failed to delete exam' },
      { status: 500 }
    );
  }
}
