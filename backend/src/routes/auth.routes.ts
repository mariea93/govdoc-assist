import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateOrganizationSchema,
  updatePreferencesSchema,
  updateProfileSchema,
} from "../validators/schemas.js";
import * as authController from "../controllers/auth.controller.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);
router.patch("/password", authenticate, validateBody(changePasswordSchema), authController.changePassword);

router.get("/users/me/preferences", authenticate, userController.getPreferences);
router.patch("/users/me/preferences", authenticate, validateBody(updatePreferencesSchema), userController.updatePreferences);
router.patch("/users/me/profile", authenticate, validateBody(updateProfileSchema), userController.updateProfile);
router.get("/users/me/organization", authenticate, userController.getOrganization);
router.patch("/users/me/organization", authenticate, validateBody(updateOrganizationSchema), userController.updateOrganization);

export default router;
