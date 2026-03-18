import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';
import { randomUUID } from 'crypto';

// GET - Get shared exam by token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const sharedLink = await db.sharedLink.findUnique({
      where: { token },
      include: {
        exam: {
          include: {
            examQuestions: {
              include: {
                question: true,
              },
              orderBy: { questionNum: 'asc' },
            },
          },
        },
      },
    });

    if (!sharedLink || !sharedLink.isActive) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }

    if (sharedLink.expiresAt && new Date() > sharedLink.expiresAt) {
      return NextResponse.json({ error: 'Link has expired' }, { status: 410 });
    }

    if (sharedLink.maxViews && sharedLink.viewCount >= sharedLink.maxViews) {
      return NextResponse.json({ error: 'Maximum views reached' }, { status: 410 });
    }

    // Increment view count
    await db.sharedLink.update({
      where: { id: sharedLink.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      exam: sharedLink.exam,
      allowDownload: sharedLink.allowDownload,
    });
  } catch (error) {
    console.error('Shared exam fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch shared exam' }, { status: 500 });
  }
}

// POST - Create share link
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { examId, expiresIn, maxViews, allowDownload } = await request.json();

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID required' }, { status: 400 });
    }

    // Verify exam ownership
    const exam = await db.exam.findUnique({
      where: { id: examId },
    });

    if (!exam || exam.userId !== (user as any).id) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const token = randomUUID();
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 60 * 60 * 1000) // hours to ms
      : null;

    const sharedLink = await db.sharedLink.create({
      data: {
        examId,
        userId: (user as any).id,
        token,
        expiresAt,
        maxViews,
        allowDownload: allowDownload ?? true,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/shared/${token}`;

    return NextResponse.json({
      ...sharedLink,
      shareUrl,
    });
  } catch (error) {
    console.error('Share link creation error:', error);
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}

// DELETE - Revoke share link
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID required' }, { status: 400 });
    }

    const sharedLink = await db.sharedLink.findUnique({
      where: { id: tokenId },
    });

    if (!sharedLink || sharedLink.userId !== (user as any).id) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
    }

    await db.sharedLink.update({
      where: { id: tokenId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share link revocation error:', error);
    return NextResponse.json({ error: 'Failed to revoke share link' }, { status: 500 });
  }
}
