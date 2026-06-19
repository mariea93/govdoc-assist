import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env.js";

if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      allowedMimeTypes.has(file.mimetype) ||
      [".pdf", ".docx", ".txt"].includes(ext)
    ) {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF, DOCX, and TXT files are allowed"));
  },
});
