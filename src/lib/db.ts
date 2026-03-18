import { PrismaClient } from '@prisma/client'

// Force new instance on each import during development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Always create a new instance to pick up schema changes
export const db = new PrismaClient({
  log: ['query'],
})

if (process.env.NODE_ENV !== 'production') {
  // Clear old instance and set new one
  if (globalForPrisma.prisma) {
    globalForPrisma.prisma.$disconnect().catch(() => {})
  }
  globalForPrisma.prisma = db
}
