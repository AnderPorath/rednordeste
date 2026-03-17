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
exports.companiesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const path_1 = __importDefault(require("path"));
const data = __importStar(require("../data"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../upload");
const companySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    logo: zod_1.z.string().url().optional(),
    description: zod_1.z.string().optional().default(""),
    email: zod_1.z.string().email(),
    location: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1).optional(),
});
exports.companiesRouter = (0, express_1.Router)();
// GET /companies?city=
exports.companiesRouter.get("/", async (req, res) => {
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
// GET /companies/candidates/:userId  (empresa autenticada)
exports.companiesRouter.get("/candidates/:userId", auth_1.requireCompany, async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId)
            return res.status(400).json({ error: "userId requerido" });
        const candidate = await data.getCandidateForCompany({
            companyId: req.company.companyId,
            userId,
        });
        if (!candidate)
            return res.status(404).json({ error: "Candidato no encontrado" });
        res.json(candidate);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /companies/:id
exports.companiesRouter.get("/:id", async (req, res) => {
    try {
        const company = await data.getCompanyById(req.params.id);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        res.json(company);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /companies
exports.companiesRouter.post("/", async (req, res) => {
    try {
        const parseResult = companySchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        const { password, ...rest } = parseResult.data;
        const passwordHash = password ? await bcryptjs_1.default.hash(password, 10) : undefined;
        const newCompany = await data.createCompany({ ...rest, passwordHash });
        res.status(201).json(newCompany);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /companies/me
exports.companiesRouter.get("/me", auth_1.requireCompany, async (req, res) => {
    try {
        const company = await data.getCompanyById(req.company.companyId);
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        res.json(company);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// PATCH /companies/me
exports.companiesRouter.patch("/me", auth_1.requireCompany, async (req, res) => {
    try {
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(1).optional(),
            description: zod_1.z.string().optional(),
            location: zod_1.z.string().min(1).optional(),
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            const flat = parsed.error.flatten();
            const firstMsg = flat.formErrors[0] || (flat.fieldErrors && Object.values(flat.fieldErrors).flat()[0]) || "Datos inválidos";
            return res.status(400).json({ error: firstMsg });
        }
        const updated = await data.updateCompany(req.company.companyId, parsed.data);
        if (!updated)
            return res.status(404).json({ error: "Company not found" });
        res.json(updated);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /companies/me/logo
exports.companiesRouter.post("/me/logo", auth_1.requireCompany, upload_1.uploadCompanyLogo.single("logo"), async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: "No se envió archivo de imagen" });
        const logoPath = "/uploads/logos/" + path_1.default.basename(file.path);
        const updated = await data.updateCompany(req.company.companyId, { logo: logoPath });
        if (!updated)
            return res.status(404).json({ error: "Company not found" });
        res.json(updated);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
