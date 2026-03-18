import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const formats = await db.examFormat.findMany({
      where: { isActive: true },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    
    return NextResponse.json({ formats });
  } catch (error) {
    console.error('Error fetching exam formats:', error);
    return NextResponse.json({ error: 'Failed to fetch exam formats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, country, examType, sections, isDefault } = await request.json();
    
    const format = await db.examFormat.create({
      data: {
        name,
        description,
        country,
        examType,
        isDefault: isDefault || false,
      },
    });
    
    // Create sections
    const createdSections: Awaited<ReturnType<typeof db.examSection.create>>[] = [];
    for (const section of sections) {
      const createdSection = await db.examSection.create({
        data: {
          formatId: format.id,
          sectionLabel: section.sectionLabel,
          sectionName: section.sectionName,
          questionType: section.questionType,
          marksPerQuestion: section.marksPerQuestion,
          totalMarks: section.totalMarks,
          instructions: section.instructions,
          sortOrder: section.sortOrder,
        },
      });
      createdSections.push(createdSection);
    }
    
    return NextResponse.json({ format, sections: createdSections });
  } catch (error) {
    console.error('Error creating exam format:', error);
    return NextResponse.json({ error: 'Failed to create exam format' }, { status: 500 });
  }
}
