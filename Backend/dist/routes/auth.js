"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const normalizedEmail = (email) => email.toLowerCase().trim();
// POST /auth/login — email + password; detecta automáticamente admin, empresa o candidato.
// Respuesta: { userType: "admin"|"company"|"user", token?, admin?, company?, user? }
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/login", async (req, res) => {
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        const { email, password } = parseResult.data;
        const emailNorm = normalizedEmail(email);
        // 1) Admin
        const admin = await db_1.prisma.admin.findUnique({
            where: { email: emailNorm },
        });
        if (admin) {
            const ok = await bcryptjs_1.default.compare(password, admin.passwordHash);
            if (ok) {
                const token = (0, auth_1.signAdminToken)({ adminId: admin.id, email: admin.email });
                return res.json({
                    userType: "admin",
                    token,
                    admin: {
                        id: admin.id,
                        email: admin.email,
                        name: admin.name,
                        avatar: admin.avatar ?? undefined,
                    },
                });
            }
            return res.status(401).json({ error: "Email o contraseña incorrectos" });
        }
        // 2) Empresa (email único)
        const company = await db_1.prisma.company.findUnique({
            where: { email: emailNorm },
        });
        if (company?.passwordHash) {
            const ok = await bcryptjs_1.default.compare(password, company.passwordHash);
            if (ok) {
                const token = (0, auth_1.signCompanyToken)({ companyId: company.id, email: company.email });
                return res.json({
                    userType: "company",
                    token,
                    company: {
                        id: company.id,
                        name: company.name,
                        email: company.email,
                        location: company.location,
                        description: company.description,
                        logo: company.logo ?? undefined,
                    },
                });
            }
            return res.status(401).json({ error: "Email o contraseña incorrectos" });
        }
        // 3) Candidato (User)
        const user = await db_1.prisma.user.findUnique({
            where: { email: emailNorm },
        });
        if (user?.passwordHash) {
            const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (ok) {
                const token = (0, auth_1.signUserToken)({ userId: user.id, email: user.email });
                return res.json({
                    userType: "user",
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        description: user.description,
                        avatar: user.avatar ?? undefined,
                        cvUrl: user.cvUrl ?? undefined,
                    },
                });
            }
            return res.status(401).json({ error: "Email o contraseña incorrectos" });
        }
        // No encontrado en ninguno o sin contraseña
        return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});
