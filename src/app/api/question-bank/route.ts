import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';

// GET - Get user's question bank
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const tag = searchParams.get('tag');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build filters
    const where: any = { userId: (user as any).id };
    
    if (folder) {
      where.folder = folder;
    }

    if (tag) {
      where.question = { tags: { some: { tag: { name: tag } } } };
    }

    if (subject) {
      if (!where.question) where.question = {};
      where.question.subjectId = subject;
    }

    if (difficulty) {
      if (!where.question) where.question = {};
      where.question.difficulty = difficulty;
    }

    if (search) {
      if (!where.question) where.question = {};
      where.question.questionText = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      db.questionBankItem.findMany({
        where,
        include: {
          question: {
            include: {
              subject: true,
              classLevel: true,
              topic: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { addedAt: 'desc' },
      }),
      db.questionBankItem.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Question bank fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch question bank' }, { status: 500 });
  }
}

// POST - Add question to bank
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId, folder, notes } = await request.json();

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    // Check if already in bank
    const existing = await db.questionBankItem.findUnique({
      where: {
        userId_questionId: {
          userId: (user as any).id,
          questionId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Question already in bank' }, { status: 400 });
    }

    const item = await db.questionBankItem.create({
      data: {
        userId: (user as any).id,
        questionId,
        folder,
        notes,
      },
      include: {
        question: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Add to bank error:', error);
    return NextResponse.json({ error: 'Failed to add question to bank' }, { status: 500 });
  }
}

// DELETE - Remove from bank
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    await db.questionBankItem.delete({
      where: {
        userId_questionId: {
          userId: (user as any).id,
          questionId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from bank error:', error);
    return NextResponse.json({ error: 'Failed to remove from bank' }, { status: 500 });
  }
}
