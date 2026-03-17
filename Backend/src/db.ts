import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

const sqliteUrl = process.env.DATABASE_URL || "file:./prisma/red_nordeste.db";

function createPrisma(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Siempre usamos base de datos (SQLite por defecto) */
export const usePostgres = false;
