import { Router } from "express";
import authRoutes from "./auth.routes.js";
import documentsRoutes from "./documents.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "govlingua-backend" });
});

router.use("/auth", authRoutes);
router.use("/documents", documentsRoutes);
router.use("/", dashboardRoutes);
router.use("/admin", adminRoutes);

export default router;
