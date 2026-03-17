"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCompanyLogo = exports.uploadCv = exports.uploadAvatar = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const uploadsDir = path_1.default.resolve(path_1.default.join(__dirname, "..", "uploads", "avatars"));
const cvsDir = path_1.default.resolve(path_1.default.join(__dirname, "..", "uploads", "cvs"));
const logosDir = path_1.default.resolve(path_1.default.join(__dirname, "..", "uploads", "logos"));
if (!fs_1.default.existsSync(uploadsDir))
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
if (!fs_1.default.existsSync(cvsDir))
    fs_1.default.mkdirSync(cvsDir, { recursive: true });
if (!fs_1.default.existsSync(logosDir))
    fs_1.default.mkdirSync(logosDir, { recursive: true });
const avatarStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || ".jpg";
        const safe = ext.toLowerCase().match(/\.(jpe?g|png|gif|webp)$/) ? ext : ".jpg";
        cb(null, `avatar-${Date.now()}${safe}`);
    },
});
const logoStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, logosDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || ".jpg";
        const safe = ext.toLowerCase().match(/\.(jpe?g|png|gif|webp)$/) ? ext : ".jpg";
        cb(null, `logo-${Date.now()}${safe}`);
    },
});
const cvStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, cvsDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || ".pdf";
        const safe = /\.(pdf|doc|docx)$/i.test(ext) ? ext : ".pdf";
        cb(null, `cv-${Date.now()}${safe}`);
    },
});
exports.uploadAvatar = (0, multer_1.default)({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const ok = /^image\/(jpe?g|png|gif|webp)$/i.test(file.mimetype);
        if (!ok)
            return cb(new Error("Solo se permiten imágenes (JPEG, PNG, GIF, WebP)"));
        cb(null, true);
    },
});
exports.uploadCv = (0, multer_1.default)({
    storage: cvStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const ok = /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/i.test(file.mimetype);
        if (!ok)
            return cb(new Error("Solo se permiten PDF o DOC/DOCX"));
        cb(null, true);
    },
});
exports.uploadCompanyLogo = (0, multer_1.default)({
    storage: logoStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const ok = /^image\/(jpe?g|png|gif|webp)$/i.test(file.mimetype);
        if (!ok)
            return cb(new Error("Solo se permiten imágenes (JPEG, PNG, GIF, WebP)"));
        cb(null, true);
    },
});
