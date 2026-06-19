import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  office: z.string().min(1).max(120).optional(),
});

export const updatePreferencesSchema = z.object({
  interfaceLanguage: z.enum(["en", "rw", "fr"]).optional(),
  defaultSummaryLength: z.enum(["short", "medium", "detailed"]).optional(),
  defaultTargetLanguage: z.enum(["Kinyarwanda", "English", "French"]).optional(),
  emailNotifications: z.boolean().optional(),
});

export const updateOrganizationSchema = z.object({
  organizationName: z.string().min(1).max(200).optional(),
  province: z.string().min(1).max(200).optional(),
  contactEmail: z.string().email().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(["admin", "user", "employee"]),
  office: z.string().min(1).max(120).default("Public"),
  status: z.enum(["Active", "Invited", "Disabled"]).default("Active"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user", "employee"]).optional(),
  office: z.string().min(1).max(120).optional(),
  status: z.enum(["Active", "Invited", "Disabled"]).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["Active", "Invited", "Disabled"]),
});

export const createDocumentSchema = z.object({
  sourceLanguage: z.enum(["Kinyarwanda", "English", "French"]),
  targetLanguage: z.enum(["Kinyarwanda", "English", "French"]),
  action: z.enum(["summarize", "translate", "both"]),
  summaryLength: z.enum(["short", "medium", "detailed"]).optional(),
});

export const updateDocumentSchema = z.object({
  status: z.enum(["Processing", "Completed", "Failed"]).optional(),
  qualityScore: z.number().int().min(0).max(100).optional(),
});

export const updateProcessingResultSchema = z.object({
  summary: z.string().optional(),
  translation: z.string().optional(),
  summaryLanguage: z.enum(["Kinyarwanda", "English", "French"]).optional(),
  translationLanguage: z.enum(["Kinyarwanda", "English", "French"]).optional(),
  status: z.enum(["Processing", "Completed", "Failed"]).optional(),
  qualityScore: z.number().int().min(0).max(100).optional(),
});

export const textSummarizeSchema = z.object({
  text: z.string().min(30),
  sourceLanguage: z.enum(["Kinyarwanda", "English", "French"]),
  summaryLength: z.enum(["short", "medium", "detailed"]).default("medium"),
});

export const textTranslateSchema = z.object({
  text: z.string().min(1),
  sourceLanguage: z.enum(["Kinyarwanda", "English", "French"]),
  targetLanguage: z.enum(["Kinyarwanda", "English", "French"]),
});

export const validationSchema = z.object({
  action: z.enum(["approve", "reject", "improvement"]),
  feedback: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSystemSettingsSchema = z.object({
  orgName: z.string().min(1).max(200).optional(),
  defaultLanguage: z.enum(["en", "rw", "fr"]).optional(),
  defaultOutputLanguage: z.enum(["Kinyarwanda", "English", "French"]).optional(),
  passwordRequirements: z.enum(["standard", "strong", "government"]).optional(),
  docProcessedAlerts: z.boolean().optional(),
  validationAlerts: z.boolean().optional(),
  userRegistrationAlerts: z.boolean().optional(),
});

export const createReportSchema = z.object({
  reportName: z.string().min(1).max(200),
  period: z.string().min(1).max(100),
  status: z.enum(["Processing", "Completed", "Failed"]).default("Completed"),
});

export const updateReportSchema = createReportSchema.partial();

export const idParamSchema = z.object({ id: z.string().min(1) });
export const userIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const historyQuerySchema = z.object({
  search: z.string().optional(),
  language: z.string().optional(),
  action: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const adminUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["all", "admin", "user", "employee"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createActivityLogSchema = z.object({
  action: z.string().min(1),
  status: z.enum(["Approved", "Completed", "Failed"]).default("Completed"),
  metadata: z.record(z.unknown()).optional(),
});
