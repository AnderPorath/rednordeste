import path from "path";
import fs from "fs";
import { Router, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../db";
import { requireAdmin, type AuthRequest } from "../middleware/auth";
import { uploadAvatar } from "../upload";
import * as data from "../data";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "Mínimo 6 caracteres"),
});

// --- Perfil del admin (foto, nombre, cambiar contraseña) ---
adminRouter.get("/me", async (req: AuthRequest, res: Response) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.adminId },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });
    if (!admin) return res.status(404).json({ error: "Admin no encontrado" });
    res.json({
      ...admin,
      avatar: admin.avatar ?? undefined,
      createdAt: admin.createdAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function handleUpdateProfile(req: AuthRequest, res: Response) {
  try {
    const parseResult = profileUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }
    const data: { name?: string; avatar?: string | null } = {};
    if (parseResult.data.name !== undefined) data.name = parseResult.data.name;
    if (parseResult.data.avatar !== undefined) data.avatar = parseResult.data.avatar;
    const admin = await prisma.admin.update({
      where: { id: req.admin!.adminId },
      data,
      select: { id: true, email: true, name: true, avatar: true },
    });
    res.json({ ...admin, avatar: admin.avatar ?? undefined });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Internal server error";
    res.status(500).json({ error: process.env.NODE_ENV === "development" ? message : "Internal server error" });
  }
}

async function handleUpdateProfileWithFile(req: AuthRequest, res: Response) {
  try {
    const body = (req as any).body as Record<string, unknown> | undefined;
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    let avatarPath: string | null | undefined;
    if (req.file) {
      const fullPath = path.join(__dirname, "..", "uploads", "avatars", req.file.filename);
      const exists = fs.existsSync(fullPath);
      avatarPath = `/uploads/avatars/${req.file.filename}`;
      console.log("[PUT /admin/me] archivo recibido:", req.file.filename, "→", avatarPath, "existe en disco:", exists);
    } else {
      console.log("[PUT /admin/me] sin archivo. body keys:", body ? Object.keys(body) : []);
    }
    const data: { name?: string; avatar?: string | null } = {};
    if (name) data.name = name;
    if (avatarPath !== undefined) data.avatar = avatarPath;
    if (Object.keys(data).length === 0) {
      const current = await prisma.admin.findUnique({
        where: { id: req.admin!.adminId },
        select: { id: true, email: true, name: true, avatar: true },
      });
      if (!current) return res.status(404).json({ error: "Admin no encontrado" });
      return res.json({ ...current, avatar: current.avatar ?? undefined });
    }
    const admin = await prisma.admin.update({
      where: { id: req.admin!.adminId },
      data,
      select: { id: true, email: true, name: true, avatar: true },
    });
    const payload = { ...admin, avatar: admin.avatar ?? undefined };
    console.log("[PUT /admin/me] guardado. avatar en respuesta:", payload.avatar);
    res.json(payload);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

adminRouter.patch("/me", handleUpdateProfile);
adminRouter.put(
  "/me",
  (req: AuthRequest, res: Response, next) => {
    uploadAvatar.single("avatar")(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : "Error al subir la imagen";
        return res.status(400).json({ error: message });
      }
      next();
    });
  },
  handleUpdateProfileWithFile
);

// Subir solo la foto de perfil (POST multipart con campo "avatar")
adminRouter.post(
  "/me/avatar",
  (req: AuthRequest, res: Response, next) => {
    uploadAvatar.single("avatar")(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : "Error al subir la imagen";
        return res.status(400).json({ error: message });
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response) => {
    try {
      const ct = req.headers["content-type"] || "";
      console.log("[POST /admin/me/avatar] Content-Type:", ct.slice(0, 50), "req.file:", !!req.file);
      if (!req.file) {
        return res.status(400).json({ error: "No se envió ninguna imagen" });
      }
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      const admin = await prisma.admin.update({
        where: { id: req.admin!.adminId },
        data: { avatar: avatarPath },
        select: { id: true, email: true, name: true, avatar: true },
      });
      res.json({ ...admin, avatar: admin.avatar ?? undefined });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e instanceof Error ? e.message : "Internal server error" });
    }
  }
);

adminRouter.post("/me/change-password", async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }
    const { currentPassword, newPassword } = parseResult.data;
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.adminId },
    });
    if (!admin) return res.status(404).json({ error: "Admin no encontrado" });
    const ok = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash },
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  description: z.string().optional(),
  avatar: z.string().url().optional().nullable(),
  cvUrl: z.string().optional().nullable(),
});

const companyUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  email: z.string().email().optional(),
  location: z.string().min(1).optional(),
  logo: z.string().url().optional().nullable(),
});

const jobUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  salary: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  companyId: z.string().optional(),
});

const adminCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  avatar: z.string().url().optional().nullable(),
});

const adminUpdateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional().nullable(),
  password: z.string().min(6).optional(),
});

// --- Usuarios (candidatos) ---
adminRouter.get("/users", async (_req: AuthRequest, res: Response) => {
  try {
    const list = await data.getUsersList();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.put("/users/:id", async (req: AuthRequest, res: Response) => {
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
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.delete("/users/:id", async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await data.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Usuario no encontrado" });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Empresas ---
adminRouter.get("/companies", async (req: AuthRequest, res: Response) => {
  try {
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const list = await data.getCompaniesList(city);
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.put("/companies/:id", async (req: AuthRequest, res: Response) => {
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
    if (!company) return res.status(404).json({ error: "Empresa no encontrada" });
    res.json(company);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.delete("/companies/:id", async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await data.deleteCompany(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Empresa no encontrada" });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Vacantes (empleos) ---
adminRouter.get("/jobs", async (req: AuthRequest, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const list = await data.getJobsListForAdmin({ search, city, type });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.put("/jobs/:id", async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = jobUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }
    if (parseResult.data.companyId !== undefined) {
      const company = await data.getCompanyById(parseResult.data.companyId);
      if (!company) return res.status(400).json({ error: "Empresa no encontrada" });
    }
    const job = await data.updateJob(req.params.id, parseResult.data as Parameters<typeof data.updateJob>[1]);
    if (!job) return res.status(404).json({ error: "Vacante no encontrada" });
    res.json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.delete("/jobs/:id", async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await data.deleteJob(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Vacante no encontrada" });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Admins ---
adminRouter.get("/admins", async (_req: AuthRequest, res: Response) => {
  try {
    const list = await data.getAdminsList();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.post("/admins", async (req: AuthRequest, res: Response) => {
  try {
    const parsed = adminCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const created = await data.createAdmin({
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      avatar: parsed.data.avatar ?? null,
    });
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.put("/admins/:id", async (req: AuthRequest, res: Response) => {
  try {
    const parsed = adminUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const d = parsed.data;
    const passwordHash = d.password ? await bcrypt.hash(d.password, 10) : undefined;
    const updated = await data.updateAdmin(req.params.id, {
      name: d.name,
      avatar: d.avatar ?? undefined,
      passwordHash: passwordHash ?? undefined,
    } as any);
    if (!updated) return res.status(404).json({ error: "Admin no encontrado" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.delete("/admins/:id", async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await data.deleteAdmin(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Admin no encontrado" });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});
