"use strict";
/**
 * Obtiene la URL de PostgreSQL igual que en Descubrepy:
 * - Si existe DATABASE_URL, se usa (para Neon, Supabase, Render, etc.).
 * - Si no, se arma con DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (y opcional DB_PORT, DB_SSL).
 * Así podés pegar los datos de Neon/Supabase sin instalar PostgreSQL en tu PC.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseUrl = getDatabaseUrl;
function buildUrlFromParts() {
    const host = process.env.DB_HOST?.trim();
    if (!host)
        return null;
    const user = process.env.DB_USER?.trim() || "postgres";
    const password = process.env.DB_PASSWORD ?? "";
    const database = process.env.DB_NAME?.trim() || "red_nordeste";
    const port = process.env.DB_PORT?.trim() || "5432";
    const needSsl = process.env.DB_SSL === "true" ||
        process.env.DATABASE_SSL === "true" ||
        process.env.PGSSLMODE === "require" ||
        host.includes("neon.tech") ||
        host.includes("supabase") ||
        host.includes("pooler.supabase");
    const base = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    const sep = database.includes("?") ? "&" : "?";
    return needSsl ? `${base}${sep}sslmode=require` : base;
}
function getDatabaseUrl() {
    const url = process.env.DATABASE_URL?.trim();
    if (url)
        return url;
    return buildUrlFromParts();
}
