import { Router } from "express";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  adminUsersQuerySchema,
  createReportSchema,
  createUserSchema,
  idParamSchema,
  updateReportSchema,
  updateSystemSettingsSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userIdParamSchema,
} from "../validators/schemas.js";
import * as adminController from "../controllers/admin.controller.js";

const router = Router();

router.use(authenticate);
router.use(requireRoles("ADMIN"));

router.get("/users", validateQuery(adminUsersQuerySchema), adminController.listUsers);
router.post("/users", validateBody(createUserSchema), adminController.createUser);
router.get("/users/:id", validateParams(userIdParamSchema), adminController.getUser);
router.patch("/users/:id", validateParams(userIdParamSchema), validateBody(updateUserSchema), adminController.updateUser);
router.patch(
  "/users/:id/status",
  validateParams(userIdParamSchema),
  validateBody(updateUserStatusSchema),
  adminController.updateUserStatus,
);
router.delete("/users/:id", validateParams(userIdParamSchema), adminController.deleteUser);

router.get("/settings", adminController.getSystemSettings);
router.patch("/settings", validateBody(updateSystemSettingsSchema), adminController.updateSystemSettings);

router.get("/activity-log", adminController.listActivityLogs);

router.get("/reports/summary", adminController.getAnalyticsSummary);
router.get("/reports/language-distribution", adminController.getLanguageDistribution);
router.get("/reports", adminController.listReports);
router.post("/reports", validateBody(createReportSchema), adminController.createReport);
router.get("/reports/:id", validateParams(idParamSchema), adminController.getReport);
router.patch("/reports/:id", validateParams(idParamSchema), validateBody(updateReportSchema), adminController.updateReport);
router.delete("/reports/:id", validateParams(idParamSchema), adminController.deleteReport);

export default router;
