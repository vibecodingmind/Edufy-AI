import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';
import ZAI from 'z-ai-web-dev-sdk';

// POST - Generate AI model answers for questions
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionIds, questionText, questionType, marks, subject, classLevel } = await request.json();

    // If specific question IDs provided, fetch them
    let questions: any[] = [];
    
    if (questionIds && questionIds.length > 0) {
      questions = await db.question.findMany({
        where: { id: { in: questionIds } },
      });
    } else if (questionText) {
      // Single question generation
      questions = [{
        questionText,
        questionType: questionType || 'short_answer',
        marks: marks || 5,
      }];
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions to generate answers for' }, { status: 400 });
    }

    // Initialize ZAI
    const zai = await ZAI.create();
    
    const generatedAnswers: Array<{
      questionId: string | undefined;
      modelAnswer: string;
      keyPoints: string[];
      commonMistakes: string[];
      markingGuide: string;
    }> = [];

    for (const question of questions) {
      const prompt = `You are an expert ${subject || 'education'} teacher for ${classLevel || 'secondary school'} students.

Generate a detailed model answer for this question:

Question: ${question.questionText}
Question Type: ${question.questionType}
Marks: ${question.marks}

Provide:
1. A comprehensive model answer appropriate for the marks allocated
2. Key points that must be included for full marks
3. Common mistakes students make
4. A marking guide/scheme

Format your response as JSON:
{
  "modelAnswer": "the complete model answer",
  "keyPoints": ["point1", "point2", ...],
  "commonMistakes": ["mistake1", "mistake2", ...],
  "markingGuide": "how to allocate marks"
}`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: 'You are an expert education assistant. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        thinking: { type: 'disabled' }
      });

      const responseContent = completion.choices[0]?.message?.content || '';

      let answerData;
      try {
        // Try to parse JSON from response
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          answerData = JSON.parse(jsonMatch[0]);
        } else {
          answerData = {
            modelAnswer: responseContent,
            keyPoints: [],
            commonMistakes: [],
            markingGuide: '',
          };
        }
      } catch {
        answerData = {
          modelAnswer: responseContent,
          keyPoints: [],
          commonMistakes: [],
          markingGuide: '',
        };
      }

      // If question has ID, update it
      if (question.id) {
        await db.question.update({
          where: { id: question.id },
          data: {
            modelAnswer: answerData.modelAnswer,
            markingScheme: JSON.stringify({
              keyPoints: answerData.keyPoints,
              commonMistakes: answerData.commonMistakes,
              markingGuide: answerData.markingGuide,
            }),
          },
        });
      }

      generatedAnswers.push({
        questionId: question.id,
        ...answerData,
      });
    }

    // Log activity
    await db.activity.create({
      data: {
        userId: (user as any).id,
        type: 'ai_answers_generated',
        title: 'AI Answers Generated',
        description: `Generated model answers for ${generatedAnswers.length} questions`,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      answers: generatedAnswers,
    });
  } catch (error) {
    console.error('AI answer generation error:', error);
    return NextResponse.json({ error: 'Failed to generate answers' }, { status: 500 });
  }
}
