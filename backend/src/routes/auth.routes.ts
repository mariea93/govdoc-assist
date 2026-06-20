import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "USER", "EMPLOYEE"]).optional(),
  office: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  office: z.string().optional(),
});

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getProfile(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch("/password", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(req.user!.id, data.currentPassword, data.newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch("/profile", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const result = await authService.updateProfile(req.user!.id, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
