import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import * as validationService from "../services/validation.service.js";

export async function createValidation(req: AuthenticatedRequest, res: Response) {
  const result = await validationService.createValidation(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body,
  );
  res.status(201).json(result);
}

export async function listValidations(req: AuthenticatedRequest, res: Response) {
  const result = await validationService.listValidations(req.params.id, req.user.id, req.user.role);
  res.json(result);
}

export async function saveNote(req: AuthenticatedRequest, res: Response) {
  const result = await validationService.saveValidationNote(
    req.params.id,
    req.user.id,
    req.body.notes ?? req.body.feedback ?? "",
  );
  res.status(201).json(result);
}
