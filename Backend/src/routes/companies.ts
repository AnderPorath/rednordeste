import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import path from "path";
import * as data from "../data";
import { AuthRequest, requireCompany } from "../middleware/auth";
import { uploadCompanyLogo } from "../upload";

const companySchema = z.object({
  name: z.string().min(1),
  logo: z.string().url().optional(),
  description: z.string().optional().default(""),
  email: z.string().email(),
  location: z.string().min(1),
  password: z.string().min(1).optional(),
});

export const companiesRouter = Router();

// GET /companies?city=
companiesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const list = await data.getCompaniesList(city);
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /companies/candidates/:userId  (empresa autenticada)
companiesRouter.get("/candidates/:userId", requireCompany, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: "userId requerido" });
    const candidate = await data.getCandidateForCompany({
      companyId: req.company!.companyId,
      userId,
    });
    if (!candidate) return res.status(404).json({ error: "Candidato no encontrado" });
    res.json(candidate);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /companies/:id
companiesRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const company = await data.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(company);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /companies
companiesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parseResult = companySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }
    const { password, ...rest } = parseResult.data;
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    const newCompany = await data.createCompany({ ...rest, passwordHash });
    res.status(201).json(newCompany);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /companies/me
companiesRouter.get("/me", requireCompany, async (req: AuthRequest, res: Response) => {
  try {
    const company = await data.getCompanyById(req.company!.companyId);
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /companies/me
companiesRouter.patch("/me", requireCompany, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      location: z.string().min(1).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const firstMsg = flat.formErrors[0] || (flat.fieldErrors && Object.values(flat.fieldErrors).flat()[0]) || "Datos inválidos";
      return res.status(400).json({ error: firstMsg });
    }
    const updated = await data.updateCompany(req.company!.companyId, parsed.data);
    if (!updated) return res.status(404).json({ error: "Company not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /companies/me/logo
companiesRouter.post("/me/logo", requireCompany, uploadCompanyLogo.single("logo"), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No se envió archivo de imagen" });
    const logoPath = "/uploads/logos/" + path.basename(file.path);
    const updated = await data.updateCompany(req.company!.companyId, { logo: logoPath });
    if (!updated) return res.status(404).json({ error: "Company not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});
