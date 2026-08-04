import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

export const prisma = databaseUrl.startsWith('file:')
  ? new PrismaClient({ adapter: new PrismaLibSql({ url: databaseUrl }) })
  : new PrismaClient();
