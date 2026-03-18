import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';
import ZAI from 'z-ai-web-dev-sdk';

// POST - Generate marking rubric
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { examId, questionId, questionText, marks, subject, classLevel } = await request.json();

    let questions: any[] = [];

    if (examId) {
      // Generate rubric for entire exam
      const exam = await db.exam.findUnique({
        where: { id: examId },
        include: {
          examQuestions: {
            include: { question: true },
            orderBy: { questionNum: 'asc' },
          },
        },
      });
      
      if (!exam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }

      questions = exam.examQuestions.map(eq => ({
        id: eq.questionId,
        questionNum: eq.questionNum,
        section: eq.section,
        ...eq.question,
        marks: eq.marks,
      }));
    } else if (questionId) {
      const question = await db.question.findUnique({
        where: { id: questionId },
      });
      if (question) {
        questions = [{ ...question, marks: marks || question.marks }];
      }
    } else if (questionText) {
      questions = [{ questionText, marks: marks || 10 }];
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions to generate rubric for' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const rubrics: Array<{
      questionId: string | undefined;
      [key: string]: unknown;
    }> = [];

    for (const question of questions) {
      const prompt = `You are an expert ${subject || 'education'} examiner creating a marking rubric.

Question: ${question.questionText}
Total Marks: ${question.marks}
Question Type: ${question.questionType || 'structured'}

Create a detailed marking rubric that:
1. Breaks down the marks into specific criteria
2. Describes what constitutes excellent, good, satisfactory, and poor responses
3. Provides mark allocation for each criterion
4. Includes acceptable alternative answers
5. Notes common errors to penalize

Format as JSON:
{
  "questionNumber": ${question.questionNum || 1},
  "totalMarks": ${question.marks},
  "criteria": [
    {
      "criterion": "description",
      "maxMarks": number,
      "levels": [
        {"marks": number, "description": "what earns these marks"},
        ...
      ]
    }
  ],
  "alternativeAnswers": ["acceptable alternatives"],
  "commonErrors": [
    {"error": "description", "penalty": "marks to deduct"}
  ],
  "generalGuidance": "overall marking advice"
}`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: 'You are an expert examiner. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        thinking: { type: 'disabled' }
      });

      const responseContent = completion.choices[0]?.message?.content || '';

      let rubric;
      try {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          rubric = JSON.parse(jsonMatch[0]);
        } else {
          rubric = { error: 'Could not parse rubric' };
        }
      } catch {
        rubric = { error: 'Parse error', raw: responseContent };
      }

      rubrics.push({
        questionId: question.id,
        ...rubric,
      });
    }

    // Save rubric if exam ID provided
    if (examId) {
      await db.activity.create({
        data: {
          userId: (user as any).id,
          type: 'rubric_generated',
          title: 'Marking Rubric Generated',
          description: `Generated marking rubric for ${questions.length} questions`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      rubrics,
    });
  } catch (error) {
    console.error('Rubric generation error:', error);
    return NextResponse.json({ error: 'Failed to generate marking rubric' }, { status: 500 });
  }
}
