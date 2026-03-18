import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { unlink } from 'fs/promises';

// GET - List all past papers
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const classLevelId = searchParams.get('classLevelId');
    const year = searchParams.get('year');
    
    const where: Record<string, string | number> = {};
    
    if (subjectId) where.subjectId = subjectId;
    if (classLevelId) where.classLevelId = classLevelId;
    if (year) where.year = parseInt(year);
    
    const pastPapers = await db.pastPaper.findMany({
      where,
      include: {
        subject: true,
        classLevel: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ pastPapers });
  } catch (error) {
    console.error('Error fetching past papers:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch past papers' 
    }, { status: 500 });
  }
}

// DELETE - Delete a past paper
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
    
    const pastPaper = await db.pastPaper.findUnique({
      where: { id },
    });
    
    if (!pastPaper) {
      return NextResponse.json({ error: 'Past paper not found' }, { status: 404 });
    }
    
    // Delete file from disk
    try {
      await unlink(pastPaper.filePath);
    } catch (e) {
      console.warn('Could not delete file:', e);
    }
    
    // Delete from database
    await db.pastPaper.delete({
      where: { id },
    });
    
    // Also delete questions that came from this past paper
    await db.question.deleteMany({
      where: {
        sourceType: 'past_paper',
        sourceId: id,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting past paper:', error);
    return NextResponse.json({ 
      error: 'Failed to delete past paper' 
    }, { status: 500 });
  }
}
