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
exports.applicationsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
const data = __importStar(require("../data"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../upload");
const applicationSchema = zod_1.z.object({
    jobId: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1),
    userCity: zod_1.z.string().min(1),
    cvUrl: zod_1.z.string().min(1),
    message: zod_1.z.string().optional(),
});
exports.applicationsRouter = (0, express_1.Router)();
// GET /applications?jobId=&userId=
exports.applicationsRouter.get("/", async (req, res) => {
    try {
        const { jobId, userId } = req.query;
        const list = await data.getApplicationsList({
            jobId: typeof jobId === "string" ? jobId : undefined,
            userId: typeof userId === "string" ? userId : undefined,
        });
        res.json(list);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /applications/me?jobId=  (empresa autenticada)
exports.applicationsRouter.get("/me", auth_1.requireCompany, async (req, res) => {
    try {
        const jobId = typeof req.query.jobId === "string" ? req.query.jobId : undefined;
        const list = await data.getApplicationsForCompany({
            companyId: req.company.companyId,
            jobId,
        });
        res.json(list);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /applications
exports.applicationsRouter.post("/", async (req, res) => {
    try {
        const parseResult = applicationSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }
        const newApp = await data.createApplication(parseResult.data);
        res.status(201).json(newApp);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /applications/me (requiere token de usuario + archivo cv)
exports.applicationsRouter.post("/me", auth_1.requireUser, upload_1.uploadCv.any(), async (req, res) => {
    try {
        const schema = zod_1.z.object({
            jobId: zod_1.z.string().min(1),
            userCity: zod_1.z.string().min(1),
            message: zod_1.z.string().optional(),
        });
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            const flat = parsed.error.flatten();
            const firstMsg = flat.formErrors[0] || (flat.fieldErrors && Object.values(flat.fieldErrors).flat()[0]) || "Datos inválidos";
            return res.status(400).json({ error: firstMsg });
        }
        const files = (req.files ?? []);
        const file = files[0];
        if (!file)
            return res.status(400).json({ error: "No se envió archivo (PDF o DOC)" });
        const cvPath = "/uploads/cvs/" + path_1.default.basename(file.path);
        const app = await data.createApplication({
            jobId: parsed.data.jobId,
            userId: req.user.userId,
            userCity: parsed.data.userCity,
            cvUrl: cvPath,
            message: parsed.data.message,
        });
        res.status(201).json(app);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});
