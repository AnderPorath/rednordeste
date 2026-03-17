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
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const data = __importStar(require("../data"));
const jobCreateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    salary: zod_1.z.string().min(1),
    type: zod_1.z.enum(["full-time", "part-time", "contract", "remote"]),
    city: zod_1.z.string().min(1),
    requirements: zod_1.z.array(zod_1.z.string()).default([]),
    companyId: zod_1.z.string().min(1),
    recruiterId: zod_1.z.string().optional(),
});
const jobUpdateSchema = jobCreateSchema.partial();
exports.jobsRouter = (0, express_1.Router)();
// GET /jobs?search=&city=&type=&companyId=
exports.jobsRouter.get("/", async (req, res) => {
    try {
        const { search, city, type, companyId } = req.query;
        const list = await data.getJobsList({
            search: typeof search === "string" ? search : undefined,
            city: typeof city === "string" ? city : undefined,
            type: typeof type === "string" ? type : undefined,
            companyId: typeof companyId === "string" ? companyId : undefined,
        });
        res.json(list);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /jobs/:id
exports.jobsRouter.get("/:id", async (req, res) => {
    try {
        const job = await data.getJobById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.json(job);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /jobs
exports.jobsRouter.post("/", async (req, res) => {
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
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// PATCH /jobs/:id
exports.jobsRouter.patch("/:id", async (req, res) => {
    try {
        const parseResult = jobUpdateSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        const payload = parseResult.data;
        if (payload.companyId !== undefined) {
            const company = await data.getCompanyById(payload.companyId);
            if (!company)
                return res.status(400).json({ error: "Company not found" });
        }
        const updateData = {};
        if (payload.title !== undefined)
            updateData.title = payload.title;
        if (payload.companyId !== undefined)
            updateData.companyId = payload.companyId;
        if (payload.city !== undefined)
            updateData.city = payload.city;
        if (payload.salary !== undefined)
            updateData.salary = payload.salary;
        if (payload.type !== undefined)
            updateData.type = payload.type;
        if (payload.description !== undefined)
            updateData.description = payload.description;
        if (payload.requirements !== undefined)
            updateData.requirements = payload.requirements;
        const job = await data.updateJob(req.params.id, updateData);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.json(job);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// DELETE /jobs/:id
exports.jobsRouter.delete("/:id", async (req, res) => {
    try {
        const deleted = await data.deleteJob(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.status(204).send();
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
