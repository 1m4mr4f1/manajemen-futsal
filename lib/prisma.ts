// File: lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Pastikan PrismaClient diinisialisasi dengan adapter untuk Prisma 7
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;