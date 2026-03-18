import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

// GET - Get user analytics
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const days = parseInt(period);
    const startDate = subDays(new Date(), days);

    const userId = (user as any).id;

    // Get activities in period
    const activities = await db.activity.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get exams created
    const examsCreated = await db.exam.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    // Get exams by status
    const examsByStatus = await db.exam.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    });

    // Get questions created
    const questionsCreated = await db.question.count({
      where: {
        sourceId: userId,
        sourceType: 'manual',
        createdAt: { gte: startDate },
      },
    });

    // Get subscription info
    const subscription = await db.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    // Daily activity breakdown
    const dailyActivity = await db.activity.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // Format daily activity
    const activityByDay: Record<string, number> = {};
    dailyActivity.forEach(a => {
      const day = format(a.createdAt, 'yyyy-MM-dd');
      activityByDay[day] = (activityByDay[day] || 0) + a._count;
    });

    // Activity by type
    const activityByType = activities.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Resource uploads
    const pastPapersCount = await db.pastPaper.count({
      where: { userId, createdAt: { gte: startDate } },
    });

    const textbooksCount = await db.textbook.count({
      where: { userId, createdAt: { gte: startDate } },
    });

    const syllabusCount = await db.syllabusDoc.count({
      where: { userId, createdAt: { gte: startDate } },
    });

    return NextResponse.json({
      period: { days, start: startDate, end: new Date() },
      summary: {
        examsCreated,
        questionsCreated,
        pastPapersUploaded: pastPapersCount,
        textbooksUploaded: textbooksCount,
        syllabusUploaded: syllabusCount,
      },
      examsByStatus: examsByStatus.reduce((acc, e) => {
        acc[e.status] = e._count;
        return acc;
      }, {} as Record<string, number>),
      activityByDay,
      activityByType,
      recentActivities: activities.slice(0, 10),
      subscription: subscription ? {
        plan: subscription.plan.name,
        status: subscription.status,
        examsThisMonth: subscription.examsThisMonth,
        maxExams: subscription.plan.maxExamsPerMonth,
      } : null,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
