import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as documentService from "../services/document.service.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { env } from "../config/env.js";

const router = Router();

const textSubmitSchema = z.object({
  text: z.string().min(1, "Text is required"),
  sourceLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  action: z.enum(["summarize", "translate", "summarize_translate"]),
});

const updateDocSchema = z.object({
  sourceLanguage: z.string().optional(),
  targetLanguage: z.string().optional(),
  action: z.enum(["summarize", "translate", "summarize_translate"]).optional(),
});

const processingUpdateSchema = z.object({
  status: z.enum(["processing", "completed", "failed"]),
  summary: z.string().optional(),
  translation: z.string().optional(),
  qualityScore: z.number().min(0).max(100).optional(),
});

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      const { sourceLanguage, targetLanguage, action } = req.body;
      if (!sourceLanguage || !targetLanguage || !action) {
        res.status(400).json({ error: "sourceLanguage, targetLanguage, and action are required" });
        return;
      }

      const result = await documentService.uploadDocument({
        userId: req.user!.id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        sourceLanguage,
        targetLanguage,
        action,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/summarize", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = textSubmitSchema.parse({ ...req.body, action: "summarize" });
    const result = await documentService.submitText({ userId: req.user!.id, ...data });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/translate", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = textSubmitSchema.parse({ ...req.body, action: "translate" });
    const result = await documentService.submitText({ userId: req.user!.id, ...data });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, action, search } = req.query;
    const result = await documentService.getDocuments(req.user!.id, req.user!.role, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string,
      action: action as string,
      search: search as string,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/history", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await documentService.getHistory(req.user!.id, req.user!.role, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/content", (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-processing-api-key"] as string;
  if (apiKey !== env.PROCESSING_API_KEY) {
    res.status(401).json({ error: "Invalid processing API key" });
    return;
  }
  next();
}, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, mimeType, fileName } = await documentService.getDocumentContent(req.params.id);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.send(content);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await documentService.getDocumentById(req.params.id, req.user!.id, req.user!.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateDocSchema.parse(req.body);
    const result = await documentService.updateDocument(req.params.id, req.user!.id, req.user!.role, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await documentService.deleteDocument(req.params.id, req.user!.id, req.user!.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Webhook for Python AI service to update processing results
router.patch(
  "/:id/processing",
  (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers["x-processing-api-key"] as string;
    if (apiKey !== env.PROCESSING_API_KEY) {
      res.status(401).json({ error: "Invalid processing API key" });
      return;
    }
    next();
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = processingUpdateSchema.parse(req.body);
      const result = await documentService.updateProcessingStatus(req.params.id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
