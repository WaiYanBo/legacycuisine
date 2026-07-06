import "dotenv/config";
import { defineConfig } from "prisma/config";

// Fallback to a dummy connection string in development/CI environments
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/legacy_cuisine?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
