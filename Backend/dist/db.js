"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePostgres = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const globalForPrisma = globalThis;
const sqliteUrl = process.env.DATABASE_URL || "file:./prisma/red_nordeste.db";
function createPrisma() {
    const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: sqliteUrl });
    return new client_1.PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
}
exports.prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
/** Siempre usamos base de datos (SQLite por defecto) */
exports.usePostgres = false;
