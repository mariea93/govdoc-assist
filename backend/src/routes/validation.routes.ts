import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as validationService from "../services/validation.service.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

const validationSchema = z.object({
  action: z.enum(["approve", "reject", "improvement"]),
  feedback: z.string().optional(),
  notes: z.string().optional(),
});

const noteSchema = z.object({
  notes: z.string().min(1, "Notes are required"),
});

router.get(
  "/review",
  authenticate,
  authorize("EMPLOYEE", "ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query;
      const result = await validationService.getDocumentsForReview(req.user!.id, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:documentId/validation",
  authenticate,
  authorize("EMPLOYEE", "ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validationSchema.parse(req.body);
      const result = await validationService.createValidation({
        documentId: req.params.documentId,
        userId: req.user!.id,
        ...data,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:documentId/validation",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await validationService.getValidations(req.params.documentId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:documentId/validation/note",
  authenticate,
  authorize("EMPLOYEE", "ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = noteSchema.parse(req.body);
      const result = await validationService.addValidationNote({
        documentId: req.params.documentId,
        userId: req.user!.id,
        notes: data.notes,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
