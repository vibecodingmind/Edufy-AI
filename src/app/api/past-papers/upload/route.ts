import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const year = parseInt(formData.get('year') as string);
    const examType = formData.get('examType') as string;
    const term = formData.get('term') as string;
    const subjectId = formData.get('subjectId') as string;
    const classLevelId = formData.get('classLevelId') as string;
    
    if (!file || !title || !subjectId || !classLevelId) {
      return NextResponse.json({ 
        error: 'Missing required fields: file, title, subjectId, classLevelId' 
      }, { status: 400 });
    }
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', 'past-papers');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadDir, fileName);
    
    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Determine file type
    const fileType = fileExtension?.toLowerCase() || 'unknown';
    
    // Save to database
    const pastPaper = await db.pastPaper.create({
      data: {
        title,
        description: description || null,
        year: year || new Date().getFullYear(),
        examType: examType || 'national',
        term: term || null,
        filePath,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        extractionStatus: 'pending',
        extractedCount: 0,
        subjectId,
        classLevelId,
        userId: session.userId,
      },
      include: {
        subject: true,
        classLevel: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      pastPaper,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload past paper' 
    }, { status: 500 });
  }
}
