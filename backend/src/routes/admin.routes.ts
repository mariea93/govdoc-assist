import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as adminService from "../services/admin.service.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "USER", "EMPLOYEE"]),
  office: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "USER", "EMPLOYEE"]).optional(),
  office: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "INVITED", "DISABLED"]),
});

const settingsSchema = z.object({
  organizationName: z.string().optional(),
  defaultSourceLanguage: z.string().optional(),
  defaultTargetLanguage: z.string().optional(),
  maxFileSize: z.number().optional(),
  allowedFileTypes: z.string().optional(),
  minPasswordLength: z.number().optional(),
  requireSpecialChar: z.boolean().optional(),
  sessionTimeout: z.number().optional(),
  enableEmailNotification: z.boolean().optional(),
  enableProcessingAlerts: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
});

const reportSchema = z.object({
  reportName: z.string().min(1),
  period: z.string().min(1),
  type: z.string().optional(),
});

const updateReportSchema = z.object({
  reportName: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  content: z.any().optional(),
});

// User management
router.get("/users", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, role, status, search } = req.query;
    const result = await adminService.getUsers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      role: role as string,
      status: status as string,
      search: search as string,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/users/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post("/users", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await adminService.createUser(data);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await adminService.updateUser(req.params.id, data);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id/status", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const user = await adminService.updateUserStatus(req.params.id, status);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// System settings
router.get("/settings", authenticate, authorize("ADMIN"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await adminService.getSystemSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.patch("/settings", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = settingsSchema.parse(req.body);
    const settings = await adminService.updateSystemSettings(data);
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Activity log
router.get("/activity-log", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, userId } = req.query;
    const result = await adminService.getActivityLog({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      userId: userId as string,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Reports
router.get("/reports", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status } = req.query;
    const result = await adminService.getReports({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/reports", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = reportSchema.parse(req.body);
    const report = await adminService.createReport({ ...data, createdBy: req.user!.id });
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

router.patch("/reports/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateReportSchema.parse(req.body);
    const report = await adminService.updateReport(req.params.id, data);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

router.delete("/reports/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.deleteReport(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Analytics
router.get("/analytics/summary", authenticate, authorize("ADMIN"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await adminService.getAnalyticsSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/languages", authenticate, authorize("ADMIN"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const distribution = await adminService.getLanguageDistribution();
    res.json(distribution);
  } catch (error) {
    next(error);
  }
});

export default router;
