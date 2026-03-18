import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-config';
import { randomUUID } from 'crypto';

// GET - List user's API keys
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keys = await db.apiKey.findMany({
      where: { userId: (user as any).id },
      select: {
        id: true,
        name: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('API keys fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, permissions } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    // Generate API key
    const fullKey = `edu_${randomUUID().replace(/-/g, '')}`;
    const prefix = fullKey.substring(0, 12) + '...';

    const apiKey = await db.apiKey.create({
      data: {
        userId: (user as any).id,
        name,
        key: fullKey,
        prefix,
        permissions: permissions ? JSON.stringify(permissions) : null,
      },
    });

    // Return full key only on creation
    return NextResponse.json({
      key: {
        id: apiKey.id,
        name: apiKey.name,
        key: fullKey, // Only shown once!
        prefix: apiKey.prefix,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    console.error('API key creation error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}

// DELETE - Revoke API key
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
    }

    // Verify ownership
    const key = await db.apiKey.findUnique({
      where: { id },
    });

    if (!key || key.userId !== (user as any).id) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    await db.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API key revocation error:', error);
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }
}
