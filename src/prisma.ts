import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

export const prisma = (databaseUrl && databaseUrl.startsWith('file:'))
  ? new PrismaClient({ adapter: new PrismaLibSql({ url: databaseUrl }) })
  : new PrismaClient();
