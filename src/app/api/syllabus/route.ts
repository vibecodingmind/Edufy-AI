import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { unlink } from 'fs/promises';

// GET - List all syllabus documents
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
    
    const syllabusDocs = await db.syllabusDoc.findMany({
      where,
      include: {
        subject: true,
        classLevel: true,
        user: {
          select: { id: true, name: true },
        },
        syllabusTopics: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ syllabusDocs });
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch syllabus documents' 
    }, { status: 500 });
  }
}

// DELETE - Delete a syllabus document
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
    
    const syllabusDoc = await db.syllabusDoc.findUnique({
      where: { id },
    });
    
    if (!syllabusDoc) {
      return NextResponse.json({ error: 'Syllabus document not found' }, { status: 404 });
    }
    
    // Delete file
    try {
      await unlink(syllabusDoc.filePath);
    } catch (e) {
      console.warn('Could not delete file:', e);
    }
    
    // Delete related topics
    await db.syllabusTopic.deleteMany({
      where: { syllabusDocId: id },
    });
    
    // Delete document
    await db.syllabusDoc.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting syllabus:', error);
    return NextResponse.json({ 
      error: 'Failed to delete syllabus document' 
    }, { status: 500 });
  }
}
