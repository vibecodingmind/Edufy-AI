import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

// Password hashing with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Session management
export async function createSession(userId: string): Promise<string> {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  // Store session in cookie
  const cookieStore = await cookies();
  cookieStore.set('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
  
  // Store session in database
  cookieStore.set('user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
  
  // Update last login
  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
  
  return sessionId;
}

export async function getSession(): Promise<{ userId: string; user: { id: string; email: string; name: string; role: string; avatar?: string | null } } | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  
  if (!userId) {
    return null;
  }
  
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  
  if (!user) {
    return null;
  }
  
  return { userId, user };
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session_id');
  cookieStore.delete('user_id');
}

// Check if user has required subscription feature
export async function checkFeatureAccess(feature: string): Promise<{ hasAccess: boolean; subscription: { plan: { slug: string } } | null }> {
  const session = await getSession();
  if (!session) {
    return { hasAccess: false, subscription: null };
  }
  
  const subscription = await db.subscription.findUnique({
    where: { userId: session.userId },
    include: { plan: true },
  });
  
  if (!subscription || subscription.status !== 'active') {
    return { hasAccess: false, subscription: null };
  }
  
  const plan = subscription.plan;
  
  switch (feature) {
    case 'ai_generation':
      return { hasAccess: plan.aiGeneration, subscription };
    case 'pdf_export':
      return { hasAccess: plan.pdfExport, subscription };
    case 'marking_scheme':
      return { hasAccess: plan.markingScheme, subscription };
    case 'custom_formats':
      return { hasAccess: plan.customFormats, subscription };
    case 'school_branding':
      return { hasAccess: plan.schoolBranding, subscription };
    case 'analytics':
      return { hasAccess: plan.analytics, subscription };
    case 'api_access':
      return { hasAccess: plan.apiAccess, subscription };
    default:
      return { hasAccess: false, subscription };
  }
}

// Check exam generation limits
export async function checkExamLimit(): Promise<{ canGenerate: boolean; remaining: number; plan: { maxExamsPerMonth: number } }> {
  const session = await getSession();
  if (!session) {
    return { canGenerate: false, remaining: 0, plan: { maxExamsPerMonth: 0 } };
  }
  
  const subscription = await db.subscription.findUnique({
    where: { userId: session.userId },
    include: { plan: true },
  });
  
  if (!subscription) {
    return { canGenerate: false, remaining: 0, plan: { maxExamsPerMonth: 0 } };
  }
  
  const maxExams = subscription.plan.maxExamsPerMonth;
  const usedExams = subscription.examsThisMonth;
  
  if (maxExams === -1) {
    return { canGenerate: true, remaining: -1, plan: subscription.plan };
  }
  
  const remaining = Math.max(0, maxExams - usedExams);
  return { canGenerate: remaining > 0, remaining, plan: subscription.plan };
}

// Increment exam count
export async function incrementExamCount(userId: string): Promise<void> {
  await db.subscription.update({
    where: { userId },
    data: { examsThisMonth: { increment: 1 } },
  });
}
