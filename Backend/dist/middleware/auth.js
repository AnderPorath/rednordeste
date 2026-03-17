"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
exports.requireUser = requireUser;
exports.requireCompany = requireCompany;
exports.signAdminToken = signAdminToken;
exports.signUserToken = signUserToken;
exports.signCompanyToken = signCompanyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "red-nordeste-admin-secret-cambiar-en-produccion";
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({ error: "Token requerido" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    }
    catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}
function requireUser(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({ error: "Token requerido" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.userId)
            return res.status(401).json({ error: "Token inválido o expirado" });
        req.user = { userId: decoded.userId, email: decoded.email ?? "" };
        next();
    }
    catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}
function requireCompany(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({ error: "Token requerido" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.companyId)
            return res.status(401).json({ error: "Token inválido o expirado" });
        req.company = { companyId: decoded.companyId, email: decoded.email ?? "" };
        next();
    }
    catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}
function signAdminToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function signUserToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function signCompanyToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
