import path from "path";
import fs from "fs";
import multer from "multer";

const uploadsDir = path.resolve(path.join(__dirname, "..", "uploads", "avatars"));
const cvsDir = path.resolve(path.join(__dirname, "..", "uploads", "cvs"));
const logosDir = path.resolve(path.join(__dirname, "..", "uploads", "logos"));
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(cvsDir)) fs.mkdirSync(cvsDir, { recursive: true });
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const safe = ext.toLowerCase().match(/\.(jpe?g|png|gif|webp)$/) ? ext : ".jpg";
    cb(null, `avatar-${Date.now()}${safe}`);
  },
});

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, logosDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const safe = ext.toLowerCase().match(/\.(jpe?g|png|gif|webp)$/) ? ext : ".jpg";
    cb(null, `logo-${Date.now()}${safe}`);
  },
});

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, cvsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    const safe = /\.(pdf|doc|docx)$/i.test(ext) ? ext : ".pdf";
    cb(null, `cv-${Date.now()}${safe}`);
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpe?g|png|gif|webp)$/i.test(file.mimetype);
    if (!ok) return cb(new Error("Solo se permiten imágenes (JPEG, PNG, GIF, WebP)"));
    cb(null, true);
  },
});

export const uploadCv = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ok = /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/i.test(file.mimetype);
    if (!ok) return cb(new Error("Solo se permiten PDF o DOC/DOCX"));
    cb(null, true);
  },
});

export const uploadCompanyLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpe?g|png|gif|webp)$/i.test(file.mimetype);
    if (!ok) return cb(new Error("Solo se permiten imágenes (JPEG, PNG, GIF, WebP)"));
    cb(null, true);
  },
});
