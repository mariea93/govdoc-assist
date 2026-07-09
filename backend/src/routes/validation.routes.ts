import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as validationService from "../services/validation.service.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

const validationSchema = z.object({
  action: z.enum(["approve", "reject", "improvement"]).optional(),
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
      const result = await validationService.getDocumentsForReview(req.user!.id, req.user!.role, {
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
  authorize("EMPLOYEE", "ADMIN", "USER"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validationSchema.parse(req.body);
      const result = await validationService.createValidation({
        documentId: req.params.documentId as string,
        userId: req.user!.id,
        role: req.user!.role,
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
      const result = await validationService.getValidations(
        req.params.documentId as string,
        req.user!.id,
        req.user!.role
      );
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
        documentId: req.params.documentId as string,
        userId: req.user!.id,
        role: req.user!.role,
        notes: data.notes,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
