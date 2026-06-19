import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import * as userService from "../services/user.service.js";
import * as settingsService from "../services/settings.service.js";

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const result = await userService.updateProfile(req.user.id, req.body);
  res.json(result);
}

export async function getPreferences(req: AuthenticatedRequest, res: Response) {
  const result = await settingsService.getPreferences(req.user.id);
  res.json(result);
}

export async function updatePreferences(req: AuthenticatedRequest, res: Response) {
  const result = await settingsService.updatePreferences(req.user.id, req.body);
  res.json(result);
}

export async function getOrganization(req: AuthenticatedRequest, res: Response) {
  const result = await settingsService.getOrganization(req.user.id);
  res.json(result);
}

export async function updateOrganization(req: AuthenticatedRequest, res: Response) {
  const result = await settingsService.updateOrganization(req.user.id, req.body);
  res.json(result);
}
