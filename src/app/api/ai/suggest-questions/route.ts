import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';
import ZAI from 'z-ai-web-dev-sdk';

// POST - Get AI question suggestions based on topic
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topicId, subjectId, classLevelId, questionType, difficulty, count = 5 } = await request.json();

    if (!subjectId || !classLevelId) {
      return NextResponse.json({ error: 'Subject and class level required' }, { status: 400 });
    }

    // Get topic information
    let topicInfo = '';
    if (topicId) {
      const topic = await db.topic.findUnique({
        where: { id: topicId },
        include: { subtopics: true },
      });
      if (topic) {
        topicInfo = `Topic: ${topic.name}
Subtopics: ${topic.subtopics.map(s => s.name).join(', ')}`;
      }
    }

    // Get subject and class level names
    const subject = await db.subject.findUnique({ where: { id: subjectId } });
    const classLevel = await db.classLevel.findUnique({ where: { id: classLevelId } });

    const zai = await ZAI.create();

    const prompt = `You are an expert ${subject?.name || 'education'} teacher for ${classLevel?.name || 'students'}.

${topicInfo}

Generate ${count} ${questionType || 'various type'} questions with ${difficulty || 'mixed'} difficulty.

For each question provide:
1. Question text
2. Question type (MCQ, short_answer, essay, structured)
3. Difficulty (easy, medium, hard)
4. Suggested marks
5. Model answer
6. For MCQ: options and correct answer

Format as JSON array:
[
  {
    "questionText": "...",
    "questionType": "MCQ|short_answer|essay|structured",
    "difficulty": "easy|medium|hard",
    "marks": number,
    "options": ["A", "B", "C", "D"], // only for MCQ
    "correctAnswer": "...",
    "modelAnswer": "..."
  }
]`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are an expert education assistant. Always respond with valid JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      thinking: { type: 'disabled' }
    });

    const responseContent = completion.choices[0]?.message?.content || '';

    let suggestions: Array<{
      questionText: string;
      questionType: string;
      difficulty: string;
      marks: number;
      options?: string[];
      correctAnswer: string;
      modelAnswer: string;
    }> = [];
    try {
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse suggestions:', e);
    }

    return NextResponse.json({
      success: true,
      suggestions,
      topicInfo,
    });
  } catch (error) {
    console.error('Question suggestion error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
