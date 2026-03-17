import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import path from "path";
import * as data from "../data";
import { requireUser, AuthRequest } from "../middleware/auth";
import { uploadAvatar, uploadCv } from "../upload";
import { prisma } from "../db";

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  description: z.string().optional().default(""),
  cvUrl: z.string().optional(),
  password: z.string().min(1).optional(),
});

export const usersRouter = Router();

// GET /users
usersRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const list = await data.getUsersList();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /users/me — usuario actual (requiere token)
usersRouter.get("/me", requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const user = await data.getUserById(req.user!.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /users/me — actualizar nombre, descripción (y opcionalmente email)
usersRouter.patch("/me", requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      description: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const firstMsg = flat.formErrors[0] || (flat.fieldErrors && Object.values(flat.fieldErrors).flat()[0]) || "Datos inválidos";
      return res.status(400).json({ error: firstMsg });
    }
    const updated = await data.updateUser(req.user!.userId, parsed.data);
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /users/me/avatar — subir foto de perfil
usersRouter.post("/me/avatar", requireUser, uploadAvatar.single("avatar"), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No se envió archivo de imagen" });
    const avatarPath = "/uploads/avatars/" + path.basename(file.path);
    const updated = await data.updateUser(req.user!.userId, { avatar: avatarPath });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /users/me/cv — subir curriculum
usersRouter.post("/me/cv", requireUser, uploadCv.any(), async (req: AuthRequest, res: Response) => {
  try {
    const files = (req.files ?? []) as Express.Multer.File[];
    const file = files[0];
    if (!file) return res.status(400).json({ error: "No se envió archivo (PDF o DOC)" });
    const cvPath = "/uploads/cvs/" + path.basename(file.path);
    const updated = await data.updateUser(req.user!.userId, { cvUrl: cvPath });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "Mínimo 6 caracteres"),
});

// POST /users/me/change-password
usersRouter.post("/me/change-password", requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { currentPassword, newPassword } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash) return res.status(400).json({ error: "No hay contraseña configurada" });
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Contraseña actual incorrecta" });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await data.updateUserPassword(req.user!.userId, passwordHash);
    res.json({ message: "Contraseña actualizada" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /users/:id
usersRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await data.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /users
usersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parseResult = userSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }
    const { password, ...rest } = parseResult.data;
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    const newUser = await data.createUser({ ...rest, passwordHash });
    res.status(201).json(newUser);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});
