import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as userService from "../services/user.service.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

const preferencesSchema = z.object({
  interfaceLanguage: z.string().optional(),
  defaultSourceLanguage: z.string().optional(),
  defaultTargetLanguage: z.string().optional(),
  defaultSummaryLength: z.enum(["short", "medium", "long"]).optional(),
  emailNotifications: z.boolean().optional(),
  processingAlerts: z.boolean().optional(),
});

const organizationSchema = z.object({
  organizationName: z.string().optional(),
  department: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  sector: z.string().optional(),
  contactEmail: z.union([z.string().email(), z.literal("")]).optional(),
  contactPhone: z.string().optional(),
});

router.get("/preferences", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prefs = await userService.getPreferences(req.user!.id);
    res.json(prefs);
  } catch (error) {
    next(error);
  }
});

router.patch("/preferences", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = preferencesSchema.parse(req.body);
    const prefs = await userService.updatePreferences(req.user!.id, data);
    res.json(prefs);
  } catch (error) {
    next(error);
  }
});

router.get("/organization", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.getOrganizationProfile(req.user!.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.patch("/organization", authenticate, authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = organizationSchema.parse(req.body);
    const profile = await userService.updateOrganizationProfile(req.user!.id, data);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;
