import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';
import ZAI from 'z-ai-web-dev-sdk';

// POST - Predict question difficulty using AI
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionIds, questionText, subject, classLevel } = await request.json();

    // If specific question IDs provided, fetch them
    let questions: any[] = [];
    
    if (questionIds && questionIds.length > 0) {
      questions = await db.question.findMany({
        where: { id: { in: questionIds } },
      });
    } else if (questionText) {
      questions = [{ questionText }];
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions to analyze' }, { status: 400 });
    }

    const zai = await ZAI.create();
    
    const predictions: Array<{
      questionId: string | undefined;
      difficulty: string;
      confidence: number;
      cognitiveLevel: string;
      reasoning: string;
      suggestedModifications: string[];
    }> = [];

    for (const question of questions) {
      const prompt = `You are an expert educational assessment analyst for ${classLevel || 'secondary school'} ${subject || 'curriculum'}.

Analyze the difficulty level of this question:

"${question.questionText}"

Consider:
1. Cognitive complexity (recall, understanding, application, analysis, synthesis, evaluation)
2. Prior knowledge required
3. Time needed to answer
4. Common student misconceptions
5. Abstract vs concrete concepts

Provide a difficulty prediction as JSON:
{
  "difficulty": "easy|medium|hard",
  "confidence": 0.0-1.0,
  "cognitiveLevel": "remember|understand|apply|analyze|evaluate|create",
  "reasoning": "brief explanation",
  "suggestedModifications": ["suggestions to adjust difficulty if needed"]
}`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: 'You are an expert educational assessment analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        thinking: { type: 'disabled' }
      });

      const responseContent = completion.choices[0]?.message?.content || '';

      let prediction;
      try {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          prediction = JSON.parse(jsonMatch[0]);
        } else {
          prediction = {
            difficulty: 'medium',
            confidence: 0.5,
            cognitiveLevel: 'understand',
            reasoning: 'Unable to parse AI response',
            suggestedModifications: [],
          };
        }
      } catch {
        prediction = {
          difficulty: 'medium',
          confidence: 0.5,
          cognitiveLevel: 'understand',
          reasoning: 'Parse error',
          suggestedModifications: [],
        };
      }

      // Update question if has ID
      if (question.id) {
        await db.question.update({
          where: { id: question.id },
          data: {
            predictedDifficulty: prediction.difficulty === 'easy' ? 0.3 : 
                                 prediction.difficulty === 'medium' ? 0.6 : 0.9,
            difficulty: prediction.difficulty,
          },
        });
      }

      predictions.push({
        questionId: question.id,
        ...prediction,
      });
    }

    return NextResponse.json({
      success: true,
      predictions,
    });
  } catch (error) {
    console.error('Difficulty prediction error:', error);
    return NextResponse.json({ error: 'Failed to predict difficulty' }, { status: 500 });
  }
}
