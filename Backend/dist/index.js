"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_2 = require("express");
const jobs_1 = require("./routes/jobs");
const companies_1 = require("./routes/companies");
const applications_1 = require("./routes/applications");
const users_1 = require("./routes/users");
const auth_1 = require("./routes/auth");
const admin_1 = require("./routes/admin");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, helmet_1.default)());
// En producción permite el dominio del front (ej. https://tudominio.com). En desarrollo "*".
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use((0, cors_1.default)({
    origin: corsOrigin === "*" ? "*" : corsOrigin.split(",").map((o) => o.trim()),
}));
app.use((0, morgan_1.default)("dev"));
// Solo parsear JSON cuando el body sea application/json (no multipart, para que multer reciba el body)
app.use((req, res, next) => {
    const ct = req.headers["content-type"] || "";
    if (ct.includes("application/json"))
        return (0, express_2.json)()(req, res, next);
    next();
});
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/jobs", jobs_1.jobsRouter);
app.use("/companies", companies_1.companiesRouter);
app.use("/applications", applications_1.applicationsRouter);
app.use("/users", users_1.usersRouter);
app.use("/auth", auth_1.authRouter);
app.use("/admin", admin_1.adminRouter);
// Misma base que upload.ts para servir los avatares
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "..", "uploads")));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
    console.log("Data: SQLite (archivo local, sin instalar PostgreSQL)");
});
