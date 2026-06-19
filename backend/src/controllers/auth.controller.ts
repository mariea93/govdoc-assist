import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import * as authService from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body.name, req.body.email, req.body.password);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(result);
}

export async function me(req: AuthenticatedRequest, res: Response) {
  const result = await authService.getMe(req.user.id);
  res.json(result);
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  const result = await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  res.json(result);
}

export async function logout(_req: AuthenticatedRequest, res: Response) {
  res.status(204).send();
}
