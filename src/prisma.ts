import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || '';

function createPrismaClient(): PrismaClient {
  if (databaseUrl && !databaseUrl.startsWith('file:')) {
    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('supabase.co') || databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
}

export const prisma = createPrismaClient();
