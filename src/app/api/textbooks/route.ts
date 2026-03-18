import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { unlink } from 'fs/promises';

// Force reload - Prisma client updated
// GET - List all textbooks
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const classLevelId = searchParams.get('classLevelId');
    
    const where: Record<string, string> = {};
    
    if (subjectId) where.subjectId = subjectId;
    if (classLevelId) where.classLevelId = classLevelId;
    
    const textbooks = await db.textbook.findMany({
      where,
      include: {
        subject: true,
        classLevel: true,
        user: {
          select: { id: true, name: true },
        },
        chapters: {
          orderBy: { chapterNum: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ textbooks });
  } catch (error) {
    console.error('Error fetching textbooks:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch textbooks' 
    }, { status: 500 });
  }
}

// DELETE - Delete a textbook
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const textbook = await db.textbook.findUnique({
      where: { id },
    });
    
    if (!textbook) {
      return NextResponse.json({ error: 'Textbook not found' }, { status: 404 });
    }
    
    // Delete file
    try {
      await unlink(textbook.filePath);
    } catch (e) {
      console.warn('Could not delete file:', e);
    }
    
    // Delete chapters
    await db.textbookChapter.deleteMany({
      where: { textbookId: id },
    });
    
    // Delete textbook
    await db.textbook.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting textbook:', error);
    return NextResponse.json({ 
      error: 'Failed to delete textbook' 
    }, { status: 500 });
  }
}
