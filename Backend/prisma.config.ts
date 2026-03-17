import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL obligatorio en runtime (app y seed). Para solo prisma generate se usa placeholder.
const url = process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url },
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },
});
