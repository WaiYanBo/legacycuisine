import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || '';

function createPrismaClient(): PrismaClient {
  if (databaseUrl.startsWith('file:')) {
    const adapter = new PrismaLibSql({ url: databaseUrl });
    return new PrismaClient({ adapter });
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = createPrismaClient();
