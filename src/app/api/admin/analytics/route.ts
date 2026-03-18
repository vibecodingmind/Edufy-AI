import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/admin/analytics - Get platform analytics (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get various stats
    const [
      totalUsers,
      activeUsers,
      totalExams,
      totalQuestions,
      totalPastPapers,
      totalTextbooks,
      newUsersThisPeriod,
      examsThisPeriod,
      subscriptionBreakdown,
      recentActivity,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.exam.count(),
      db.question.count(),
      db.pastPaper.count(),
      db.textbook.count(),
      db.user.count({
        where: { createdAt: { gte: daysAgo } },
      }),
      db.exam.count({
        where: { createdAt: { gte: daysAgo } },
      }),
      db.subscription.groupBy({
        by: ['planId'],
        _count: { id: true },
      }),
      db.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    // Get plan names for subscription breakdown
    const plans = await db.subscriptionPlan.findMany({
      select: { id: true, name: true },
    });
    const planMap = Object.fromEntries(plans.map(p => [p.id, p.name]));
    
    const subscriptions = subscriptionBreakdown.map(s => ({
      plan: planMap[s.planId] || 'Unknown',
      count: s._count.id,
    }));

    // Get daily stats for charts
    const dailyStats = await db.analytics.findMany({
      where: { date: { gte: daysAgo } },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        totalExams,
        totalQuestions,
        totalPastPapers,
        totalTextbooks,
        newUsersThisPeriod,
        examsThisPeriod,
      },
      subscriptions,
      dailyStats,
      recentActivity,
      period: parseInt(period),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
