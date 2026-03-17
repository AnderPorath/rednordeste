"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../upload");
const data = __importStar(require("../data"));
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.use(auth_1.requireAdmin);
const profileUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    avatar: zod_1.z
        .string()
        .optional()
        .nullable()
        .transform((val) => (val === "" ? null : val)),
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6, "Mínimo 6 caracteres"),
});
// --- Perfil del admin (foto, nombre, cambiar contraseña) ---
exports.adminRouter.get("/me", async (req, res) => {
    try {
        const admin = await db_1.default.admin.findUnique({
            where: { id: req.admin.adminId },
            select: { id: true, email: true, name: true, avatar: true, createdAt: true },
        });
        if (!admin)
            return res.status(404).json({ error: "Admin no encontrado" });
        res.json({
            ...admin,
            avatar: admin.avatar ?? undefined,
            createdAt: admin.createdAt.toISOString(),
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
async function handleUpdateProfile(req, res) {
    try {
        const parseResult = profileUpdateSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        const data = {};
        if (parseResult.data.name !== undefined)
            data.name = parseResult.data.name;
        if (parseResult.data.avatar !== undefined)
            data.avatar = parseResult.data.avatar;
        const admin = await db_1.default.admin.update({
            where: { id: req.admin.adminId },
            data,
            select: { id: true, email: true, name: true, avatar: true },
        });
        res.json({ ...admin, avatar: admin.avatar ?? undefined });
    }
    catch (e) {
        console.error(e);
        const message = e instanceof Error ? e.message : "Internal server error";
        res.status(500).json({ error: process.env.NODE_ENV === "development" ? message : "Internal server error" });
    }
}
async function handleUpdateProfileWithFile(req, res) {
    try {
        const body = req.body;
        const name = typeof body?.name === "string" ? body.name.trim() : undefined;
        let avatarPath;
        if (req.file) {
            const fullPath = path_1.default.join(__dirname, "..", "uploads", "avatars", req.file.filename);
            const exists = fs_1.default.existsSync(fullPath);
            avatarPath = `/uploads/avatars/${req.file.filename}`;
            console.log("[PUT /admin/me] archivo recibido:", req.file.filename, "→", avatarPath, "existe en disco:", exists);
        }
        else {
            console.log("[PUT /admin/me] sin archivo. body keys:", body ? Object.keys(body) : []);
        }
        const data = {};
        if (name)
            data.name = name;
        if (avatarPath !== undefined)
            data.avatar = avatarPath;
        if (Object.keys(data).length === 0) {
            const current = await db_1.default.admin.findUnique({
                where: { id: req.admin.adminId },
                select: { id: true, email: true, name: true, avatar: true },
            });
            if (!current)
                return res.status(404).json({ error: "Admin no encontrado" });
            return res.json({ ...current, avatar: current.avatar ?? undefined });
        }
        const admin = await db_1.default.admin.update({
            where: { id: req.admin.adminId },
            data,
            select: { id: true, email: true, name: true, avatar: true },
        });
        const payload = { ...admin, avatar: admin.avatar ?? undefined };
        console.log("[PUT /admin/me] guardado. avatar en respuesta:", payload.avatar);
        res.json(payload);
    }
    catch (e) {
        console.error(e);
        const message = e instanceof Error ? e.message : "Internal server error";
        res.status(500).json({ error: message });
    }
}
exports.adminRouter.patch("/me", handleUpdateProfile);
exports.adminRouter.put("/me", (req, res, next) => {
    upload_1.uploadAvatar.single("avatar")(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : "Error al subir la imagen";
            return res.status(400).json({ error: message });
        }
        next();
    });
}, handleUpdateProfileWithFile);
// Subir solo la foto de perfil (POST multipart con campo "avatar")
exports.adminRouter.post("/me/avatar", (req, res, next) => {
    upload_1.uploadAvatar.single("avatar")(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : "Error al subir la imagen";
            return res.status(400).json({ error: message });
        }
        next();
    });
}, async (req, res) => {
    try {
        const ct = req.headers["content-type"] || "";
        console.log("[POST /admin/me/avatar] Content-Type:", ct.slice(0, 50), "req.file:", !!req.file);
        if (!req.file) {
            return res.status(400).json({ error: "No se envió ninguna imagen" });
        }
        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        const admin = await db_1.default.admin.update({
            where: { id: req.admin.adminId },
            data: { avatar: avatarPath },
            select: { id: true, email: true, name: true, avatar: true },
        });
        res.json({ ...admin, avatar: admin.avatar ?? undefined });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e instanceof Error ? e.message : "Internal server error" });
    }
});
exports.adminRouter.post("/me/change-password", async (req, res) => {
    try {
        const parseResult = changePasswordSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        const { currentPassword, newPassword } = parseResult.data;
        const admin = await db_1.default.admin.findUnique({
            where: { id: req.admin.adminId },
        });
        if (!admin)
            return res.status(404).json({ error: "Admin no encontrado" });
        const ok = await bcryptjs_1.default.compare(currentPassword, admin.passwordHash);
        if (!ok) {
            return res.status(401).json({ error: "Contraseña actual incorrecta" });
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        await db_1.default.admin.update({
            where: { id: admin.id },
            data: { passwordHash },
        });
        res.json({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
const userUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    description: zod_1.z.string().optional(),
    avatar: zod_1.z.string().url().optional().nullable(),
    cvUrl: zod_1.z.string().optional().nullable(),
});
const companyUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    location: zod_1.z.string().min(1).optional(),
    logo: zod_1.z.string().url().optional().nullable(),
});
const jobUpdateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    city: zod_1.z.string().min(1).optional(),
    salary: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    requirements: zod_1.z.array(zod_1.z.string()).optional(),
    companyId: zod_1.z.string().optional(),
});
// --- Usuarios (candidatos) ---
exports.adminRouter.get("/users", async (_req, res) => {
    try {
        const list = await data.getUsersList();
        res.json(list);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.adminRouter.put("/users/:id", async (req, res) => {
    try {
        const parseResult = userUpdateSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        const d = parseResult.data;
        const user = await data.updateUser(req.params.id, {
            ...d,
            avatar: d.avatar ?? undefined,
            cvUrl: d.cvUrl ?? undefined,
        });
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(user);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.adminRouter.delete("/users/:id", async (req, res) => {
    try {
        const deleted = await data.deleteUser(req.params.id);
        if (!deleted)
            return res.status(404).json({ error: "Usuario no encontrado" });
        res.status(204).send();
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// --- Empresas ---
exports.adminRouter.get("/companies", async (req, res) => {
    try {
        const city = typeof req.query.city === "string" ? req.query.city : undefined;
        const list = await data.getCompaniesList(city);
        res.json(list);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.adminRouter.put("/companies/:id", async (req, res) => {
    try {
        const parseResult = companyUpdateSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        const d = parseResult.data;
        const company = await data.updateCompany(req.params.id, {
            ...d,
            logo: d.logo ?? undefined,
        });
        if (!company)
            return res.status(404).json({ error: "Empresa no encontrada" });
        res.json(company);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.adminRouter.delete("/companies/:id", async (req, res) => {
    try {
        const deleted = await data.deleteCompany(req.params.id);
        if (!deleted)
            return res.status(404).json({ error: "Empresa no encontrada" });
        res.status(204).send();
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// --- Vacantes (empleos) ---
exports.adminRouter.get("/jobs", async (req, res) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const city = typeof req.query.city === "string" ? req.query.city : undefined;
        const type = typeof req.query.type === "string" ? req.query.type : undefined;
        const list = await data.getJobsListForAdmin({ search, city, type });
        res.json(list);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.adminRouter.put("/jobs/:id", async (req, res) => {
    try {
        const parseResult = jobUpdateSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        if (parseResult.data.companyId !== undefined) {
            const company = await data.getCompanyById(parseResult.data.companyId);
            if (!company)
                return res.status(400).json({ error: "Empresa no encontrada" });
        }
        const job = await data.updateJob(req.params.id, parseResult.data);
        if (!job)
            return res.status(404).json({ error: "Vacante no encontrada" });
        res.json(job);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.adminRouter.delete("/jobs/:id", async (req, res) => {
    try {
        const deleted = await data.deleteJob(req.params.id);
        if (!deleted)
            return res.status(404).json({ error: "Vacante no encontrada" });
        res.status(204).send();
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
