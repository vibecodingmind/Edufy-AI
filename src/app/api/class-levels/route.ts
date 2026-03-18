import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const classLevels = await db.classLevel.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    
    return NextResponse.json({ classLevels });
  } catch (error) {
    console.error('Error fetching class levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class levels' },
      { status: 500 }
    );
  }
}
