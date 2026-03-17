import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { json } from "express";
import { jobsRouter } from "./routes/jobs";
import { companiesRouter } from "./routes/companies";
import { applicationsRouter } from "./routes/applications";
import { usersRouter } from "./routes/users";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
// En producción permite el dominio del front (ej. https://tudominio.com). En desarrollo "*".
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin === "*" ? "*" : corsOrigin.split(",").map((o) => o.trim()),
  })
);
app.use(morgan("dev"));
// Solo parsear JSON cuando el body sea application/json (no multipart, para que multer reciba el body)
app.use((req, res, next) => {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("application/json")) return json()(req, res, next);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/jobs", jobsRouter);
app.use("/companies", companiesRouter);
app.use("/applications", applicationsRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
// Misma base que upload.ts para servir los avatares
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log("Data: SQLite (archivo local, sin instalar PostgreSQL)");
});
