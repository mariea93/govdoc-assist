import { Router, Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user!.id, req.user!.role);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get("/weekly-activity", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await dashboardService.getWeeklyActivity(req.user!.id, req.user!.role);
    res.json(activity);
  } catch (error) {
    next(error);
  }
});

export default router;
