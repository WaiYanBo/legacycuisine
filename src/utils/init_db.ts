import { prisma } from '../prisma';
import { hashPassword } from './security';

export async function ensureUsersTableAndSeed(): Promise<void> {
  try {
    // 1. Ensure Table Structure in PostgreSQL / SQLite
    const isPostgres = !(process.env.DATABASE_URL || '').startsWith('file:');

    if (isPostgres) {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
                CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'MANAGER', 'STAFF', 'AGENT');
            END IF;
        END$$;

        CREATE TABLE IF NOT EXISTS "users" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "username" VARCHAR(255) NOT NULL UNIQUE,
          "email" VARCHAR(255) UNIQUE,
          "full_name" VARCHAR(255) NOT NULL,
          "password_hash" VARCHAR(255) NOT NULL,
          "role" "UserRole" NOT NULL DEFAULT 'STAFF',
          "is_active" BOOLEAN NOT NULL DEFAULT true,
          "last_login" TIMESTAMP WITH TIME ZONE,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users"("username");
        CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
      `);
    }

    // 2. Check if default Super Admin exists, if not seed it
    const existingAdmin = await prisma.user.findFirst({
      where: { username: 'Wai Yan Bo' },
    });

    if (!existingAdmin) {
      const defaultPassword = 'Hahaha123!';
      const defaultHash = hashPassword(defaultPassword);

      await prisma.user.create({
        data: {
          username: 'Wai Yan Bo',
          email: 'admin@legacycuisine.com',
          fullName: 'Wai Yan Bo (Super Administrator)',
          passwordHash: defaultHash,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });
      console.log('✅ [Auth] Default Super Admin account initialized: "Wai Yan Bo"');
    }
  } catch (error) {
    console.error('⚠️ [Auth] Warning during user table initialization:', error);
  }
}
