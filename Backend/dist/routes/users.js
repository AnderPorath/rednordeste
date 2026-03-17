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
exports.usersRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const path_1 = __importDefault(require("path"));
const data = __importStar(require("../data"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../upload");
const db_1 = __importDefault(require("../db"));
const userSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    avatar: zod_1.z.string().url().optional(),
    description: zod_1.z.string().optional().default(""),
    cvUrl: zod_1.z.string().optional(),
    password: zod_1.z.string().min(1).optional(),
});
exports.usersRouter = (0, express_1.Router)();
// GET /users
exports.usersRouter.get("/", async (_req, res) => {
    try {
        const list = await data.getUsersList();
        res.json(list);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /users/me — usuario actual (requiere token)
exports.usersRouter.get("/me", auth_1.requireUser, async (req, res) => {
    try {
        const user = await data.getUserById(req.user.userId);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.json(user);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// PATCH /users/me — actualizar nombre, descripción (y opcionalmente email)
exports.usersRouter.patch("/me", auth_1.requireUser, async (req, res) => {
    try {
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(1).optional(),
            email: zod_1.z.string().email().optional(),
            description: zod_1.z.string().optional(),
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            const flat = parsed.error.flatten();
            const firstMsg = flat.formErrors[0] || (flat.fieldErrors && Object.values(flat.fieldErrors).flat()[0]) || "Datos inválidos";
            return res.status(400).json({ error: firstMsg });
        }
        const updated = await data.updateUser(req.user.userId, parsed.data);
        if (!updated)
            return res.status(404).json({ error: "User not found" });
        res.json(updated);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /users/me/avatar — subir foto de perfil
exports.usersRouter.post("/me/avatar", auth_1.requireUser, upload_1.uploadAvatar.single("avatar"), async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: "No se envió archivo de imagen" });
        const avatarPath = "/uploads/avatars/" + path_1.default.basename(file.path);
        const updated = await data.updateUser(req.user.userId, { avatar: avatarPath });
        if (!updated)
            return res.status(404).json({ error: "User not found" });
        res.json(updated);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /users/me/cv — subir curriculum
exports.usersRouter.post("/me/cv", auth_1.requireUser, upload_1.uploadCv.any(), async (req, res) => {
    try {
        const files = (req.files ?? []);
        const file = files[0];
        if (!file)
            return res.status(400).json({ error: "No se envió archivo (PDF o DOC)" });
        const cvPath = "/uploads/cvs/" + path_1.default.basename(file.path);
        const updated = await data.updateUser(req.user.userId, { cvUrl: cvPath });
        if (!updated)
            return res.status(404).json({ error: "User not found" });
        res.json(updated);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6, "Mínimo 6 caracteres"),
});
// POST /users/me/change-password
exports.usersRouter.post("/me/change-password", auth_1.requireUser, async (req, res) => {
    try {
        const parsed = changePasswordSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.flatten() });
        const { currentPassword, newPassword } = parsed.data;
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: { passwordHash: true },
        });
        if (!user?.passwordHash)
            return res.status(400).json({ error: "No hay contraseña configurada" });
        const ok = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!ok)
            return res.status(401).json({ error: "Contraseña actual incorrecta" });
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        await data.updateUserPassword(req.user.userId, passwordHash);
        res.json({ message: "Contraseña actualizada" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /users/:id
exports.usersRouter.get("/:id", async (req, res) => {
    try {
        const user = await data.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /users
exports.usersRouter.post("/", async (req, res) => {
    try {
        const parseResult = userSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        const { password, ...rest } = parseResult.data;
        const passwordHash = password ? await bcryptjs_1.default.hash(password, 10) : undefined;
        const newUser = await data.createUser({ ...rest, passwordHash });
        res.status(201).json(newUser);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
