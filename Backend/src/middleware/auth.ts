import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "red-nordeste-admin-secret-cambiar-en-produccion";

export interface AdminPayload {
  adminId: string;
  email: string;
}

export interface UserPayload {
  userId: string;
  email: string;
}

export interface CompanyPayload {
  companyId: string;
  email: string;
}

export interface AuthRequest extends Request {
  admin?: AdminPayload;
  user?: UserPayload;
  company?: CompanyPayload;
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function requireUser(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; email?: string };
    if (!decoded.userId) return res.status(401).json({ error: "Token inválido o expirado" });
    req.user = { userId: decoded.userId, email: decoded.email ?? "" };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function requireCompany(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { companyId?: string; email?: string };
    if (!decoded.companyId) return res.status(401).json({ error: "Token inválido o expirado" });
    req.company = { companyId: decoded.companyId, email: decoded.email ?? "" };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function signUserToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function signCompanyToken(payload: CompanyPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
