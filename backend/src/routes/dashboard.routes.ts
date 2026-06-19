import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as adminController from "../controllers/admin.controller.js";

const router = Router();

router.use(authenticate);

router.get("/dashboard", adminController.getDashboard);
router.get("/dashboard/weekly-activity", adminController.getWeeklyActivity);

export default router;
