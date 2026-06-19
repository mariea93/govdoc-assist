import { Router } from "express";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { requireProcessingApiKey } from "../middleware/processingAuth.js";
import { upload } from "../middleware/upload.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  createDocumentSchema,
  historyQuerySchema,
  idParamSchema,
  textSummarizeSchema,
  textTranslateSchema,
  updateDocumentSchema,
  updateProcessingResultSchema,
  validationSchema,
} from "../validators/schemas.js";
import * as documentController from "../controllers/document.controller.js";
import * as validationController from "../controllers/validation.controller.js";

const router = Router();

router.use(authenticate);
router.use(requireRoles("USER", "EMPLOYEE", "ADMIN"));

router.get("/history", validateQuery(historyQuerySchema), documentController.getHistory);
router.get("/", validateQuery(historyQuerySchema), documentController.listDocuments);
router.post("/upload", upload.single("file"), validateBody(createDocumentSchema), documentController.uploadDocument);
router.post("/summarize", validateBody(textSummarizeSchema), documentController.summarizeText);
router.post("/translate", validateBody(textTranslateSchema), documentController.translateText);

router.get("/:id", validateParams(idParamSchema), documentController.getDocument);
router.patch("/:id", validateParams(idParamSchema), validateBody(updateDocumentSchema), documentController.updateDocument);
router.delete("/:id", validateParams(idParamSchema), documentController.deleteDocument);
router.post("/:id/save-history", validateParams(idParamSchema), documentController.saveToHistory);

router.post(
  "/:id/validation",
  validateParams(idParamSchema),
  validateBody(validationSchema),
  validationController.createValidation,
);
router.get("/:id/validation", validateParams(idParamSchema), validationController.listValidations);
router.post(
  "/:id/validation/note",
  validateParams(idParamSchema),
  validationController.saveNote,
);

router.patch(
  "/:id/processing",
  requireProcessingApiKey,
  validateParams(idParamSchema),
  validateBody(updateProcessingResultSchema),
  documentController.updateProcessingResult,
);

export default router;
