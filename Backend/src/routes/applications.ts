import { Router, Request, Response } from "express";
import { z } from "zod";
import path from "path";
import * as data from "../data";
import { AuthRequest, requireCompany, requireUser } from "../middleware/auth";
import { uploadCv } from "../upload";

const applicationSchema = z.object({
  jobId: z.string().min(1),
  userId: z.string().min(1),
  userCity: z.string().min(1),
  cvUrl: z.string().min(1),
  message: z.string().optional(),
});

export const applicationsRouter = Router();

// GET /applications?jobId=&userId=
applicationsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { jobId, userId } = req.query;
    const list = await data.getApplicationsList({
      jobId: typeof jobId === "string" ? jobId : undefined,
      userId: typeof userId === "string" ? userId : undefined,
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /applications/me?jobId=  (empresa autenticada)
applicationsRouter.get("/me", requireCompany, async (req: AuthRequest, res: Response) => {
  try {
    const jobId = typeof req.query.jobId === "string" ? req.query.jobId : undefined;
    const list = await data.getApplicationsForCompany({
      companyId: req.company!.companyId,
      jobId,
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /applications
applicationsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parseResult = applicationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }
    const newApp = await data.createApplication(parseResult.data);
    res.status(201).json(newApp);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /applications/me (requiere token de usuario + archivo cv)
applicationsRouter.post("/me", requireUser, uploadCv.any(), async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      jobId: z.string().min(1),
      userCity: z.string().min(1),
      message: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const firstMsg = flat.formErrors[0] || (flat.fieldErrors && Object.values(flat.fieldErrors).flat()[0]) || "Datos inválidos";
      return res.status(400).json({ error: firstMsg });
    }
    const files = (req.files ?? []) as Express.Multer.File[];
    const file = files[0];
    if (!file) return res.status(400).json({ error: "No se envió archivo (PDF o DOC)" });
    const cvPath = "/uploads/cvs/" + path.basename(file.path);
    const app = await data.createApplication({
      jobId: parsed.data.jobId,
      userId: req.user!.userId,
      userCity: parsed.data.userCity,
      cvUrl: cvPath,
      message: parsed.data.message,
    });
    res.status(201).json(app);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});
