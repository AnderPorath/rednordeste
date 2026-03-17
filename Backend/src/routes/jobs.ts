import { Router, Request, Response } from "express";
import { z } from "zod";
import * as data from "../data";

const jobCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  salary: z.string().min(1),
  type: z.enum(["full-time", "part-time", "contract", "remote"]),
  city: z.string().min(1),
  requirements: z.array(z.string()).default([]),
  companyId: z.string().min(1),
  recruiterId: z.string().optional(),
});

const jobUpdateSchema = jobCreateSchema.partial();

export const jobsRouter = Router();

// GET /jobs?search=&city=&type=&companyId=
jobsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search, city, type, companyId } = req.query;
    const list = await data.getJobsList({
      search: typeof search === "string" ? search : undefined,
      city: typeof city === "string" ? city : undefined,
      type: typeof type === "string" ? type : undefined,
      companyId: typeof companyId === "string" ? companyId : undefined,
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /jobs/:id
jobsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const job = await data.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /jobs
jobsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parseResult = jobCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }
    const payload = parseResult.data;
    const newJob = await data.createJob({
      title: payload.title,
      description: payload.description,
      salary: payload.salary,
      type: payload.type,
      city: payload.city,
      requirements: payload.requirements,
      companyId: payload.companyId,
    });
    res.status(201).json(newJob);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /jobs/:id
jobsRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const parseResult = jobUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }
    const payload = parseResult.data as Record<string, unknown>;
    if (payload.companyId !== undefined) {
      const company = await data.getCompanyById(payload.companyId as string);
      if (!company) return res.status(400).json({ error: "Company not found" });
    }
    const job = await data.updateJob(req.params.id, {
      ...(payload.title && { title: payload.title as string }),
      ...(payload.companyId && { companyId: payload.companyId as string }),
      ...(payload.city && { city: payload.city as string }),
      ...(payload.salary && { salary: payload.salary as string }),
      ...(payload.type && { type: payload.type as string }),
      ...(payload.description && { description: payload.description as string }),
      ...(payload.requirements && { requirements: payload.requirements as string[] }),
    });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /jobs/:id
jobsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await data.deleteJob(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});
