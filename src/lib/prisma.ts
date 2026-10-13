if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://neondb_owner:npg_fvJo1S2tRmna@ep-gentle-grass-b3d3x7jh-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL =
    'postgresql://neondb_owner:npg_fvJo1S2tRmna@ep-gentle-grass-b3d3x7jh.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
}

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// Cache Prisma client across warm serverless invocations to avoid reconnection overhead
globalForPrisma.prisma = prisma
