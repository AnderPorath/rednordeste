import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { signAdminToken, signCompanyToken, signUserToken } from "../middleware/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const normalizedEmail = (email: string) => email.toLowerCase().trim();

// POST /auth/login — email + password; detecta automáticamente admin, empresa o candidato.
// Respuesta: { userType: "admin"|"company"|"user", token?, admin?, company?, user? }
export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }
    const { email, password } = parseResult.data;
    const emailNorm = normalizedEmail(email);

    // 1) Admin
    const admin = await prisma.admin.findUnique({
      where: { email: emailNorm },
    });
    if (admin) {
      const ok = await bcrypt.compare(password, admin.passwordHash);
      if (ok) {
        const token = signAdminToken({ adminId: admin.id, email: admin.email });
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
    const company = await prisma.company.findUnique({
      where: { email: emailNorm },
    });
    if (company?.passwordHash) {
      const ok = await bcrypt.compare(password, company.passwordHash);
      if (ok) {
        const token = signCompanyToken({ companyId: company.id, email: company.email });
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
    const user = await prisma.user.findUnique({
      where: { email: emailNorm },
    });
    if (user?.passwordHash) {
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (ok) {
        const token = signUserToken({ userId: user.id, email: user.email });
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
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});
