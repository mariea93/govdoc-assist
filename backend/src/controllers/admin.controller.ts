import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import * as dashboardService from "../services/dashboard.service.js";
import * as userService from "../services/user.service.js";
import * as settingsService from "../services/settings.service.js";
import * as activityLogService from "../services/activityLog.service.js";

export async function getDashboard(req: AuthenticatedRequest, res: Response) {
  const result = await dashboardService.getDashboard(req.user.id, req.user.role);
  res.json(result);
}

export async function getWeeklyActivity(req: AuthenticatedRequest, res: Response) {
  const result = await dashboardService.getWeeklyActivity(req.user.id, req.user.role);
  res.json(result);
}

export async function listUsers(req: AuthenticatedRequest, res: Response) {
  const result = await userService.listUsers(req.query as never);
  res.json(result);
}

export async function getUser(req: AuthenticatedRequest, res: Response) {
  const result = await userService.getUserById(Number(req.params.id));
  res.json(result);
}

export async function createUser(req: AuthenticatedRequest, res: Response) {
  const result = await userService.createUser(req.body);
  res.status(201).json(result);
}

export async function updateUser(req: AuthenticatedRequest, res: Response) {
  const result = await userService.updateUser(Number(req.params.id), req.body);
  res.json(result);
}

export async function updateUserStatus(req: AuthenticatedRequest, res: Response) {
  const result = await userService.updateUserStatus(Number(req.params.id), req.body.status);
  res.json(result);
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  const result = await userService.deleteUser(Number(req.params.id));
  res.json(result);
}

export async function getSystemSettings(_req: AuthenticatedRequest, res: Response) {
  const result = await settingsService.getSystemSettings();
  res.json(result);
}

export async function updateSystemSettings(req: AuthenticatedRequest, res: Response) {
  const result = await settingsService.updateSystemSettings(req.body);
  res.json(result);
}

export async function listActivityLogs(_req: AuthenticatedRequest, res: Response) {
  const result = await activityLogService.list();
  res.json(result);
}

export async function getAnalyticsSummary(_req: AuthenticatedRequest, res: Response) {
  const result = await dashboardService.getAnalyticsSummary();
  res.json(result);
}

export async function getLanguageDistribution(_req: AuthenticatedRequest, res: Response) {
  const result = await dashboardService.getLanguageDistribution();
  res.json(result);
}

export async function listReports(_req: AuthenticatedRequest, res: Response) {
  const result = await dashboardService.listReports();
  res.json(result);
}

export async function getReport(req: AuthenticatedRequest, res: Response) {
  const result = await dashboardService.getReport(req.params.id);
  res.json(result);
}

export async function createReport(req: AuthenticatedRequest, res: Response) {
  const result = await dashboardService.createReport(req.body);
  res.status(201).json(result);
}

export async function updateReport(req: AuthenticatedRequest, res: Response) {
  const result = await dashboardService.updateReport(req.params.id, req.body);
  res.json(result);
}

export async function deleteReport(req: AuthenticatedRequest, res: Response) {
  const result = await dashboardService.deleteReport(req.params.id);
  res.json(result);
}
