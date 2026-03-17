import "dotenv/config";
import { defineConfig } from "prisma/config";

// SQLite por defecto (archivo local, sin instalar nada). Podés cambiar con DATABASE_URL.
const url = process.env.DATABASE_URL || "file:./prisma/red_nordeste.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url },
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },
});
