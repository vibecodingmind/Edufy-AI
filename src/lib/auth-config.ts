import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { randomUUID } from 'crypto';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/?auth=login',
    error: '/?auth=login&error=true',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      if (account?.provider === 'google') {
        // Update last login for OAuth users
        await db.user.update({
          where: { email: token.email! },
          data: { lastLoginAt: new Date() },
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: profile.email },
        });

        if (!existingUser) {
          // Create new user from Google profile
          const newUser = await db.user.create({
            data: {
              email: profile.email,
              name: profile.name || profile.email.split('@')[0],
              password: null, // OAuth users don't have password
              role: 'teacher',
              emailVerified: new Date(),
              avatar: (profile as any).picture,
            },
          });

          // Create free subscription
          const freePlan = await db.subscriptionPlan.findUnique({
            where: { slug: 'free' },
          });

          if (freePlan) {
            await db.subscription.create({
              data: {
                userId: newUser.id,
                planId: freePlan.id,
                status: 'active',
                billingCycle: 'monthly',
              },
            });
          }
        } else if (!existingUser.emailVerified) {
          // Mark email as verified for existing users
          await db.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() },
          });
        }
      }
      return true;
    },
  },
  events: {
    async signIn({ user, account }) {
      // Log activity
      if (user.id) {
        await db.activity.create({
          data: {
            userId: user.id,
            type: account?.provider === 'google' ? 'oauth_login' : 'login',
            title: 'Signed in',
            description: `Signed in via ${account?.provider || 'credentials'}`,
          },
        }).catch(() => {});
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'educ-ai-secret-key-2024',
};

// Helper to check if user is authenticated
export async function getCurrentUser() {
  const session = await (await import('next-auth')).getServerSession(authOptions);
  return session?.user;
}
