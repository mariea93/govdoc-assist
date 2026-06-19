import type {
  AccountStatus,
  DocumentLanguage,
  PlatformLanguage,
  ProcessingAction,
  SummaryLength,
  UserRole,
  ValidationAction,
} from "@prisma/client";

export function toApiRole(role: UserRole): "admin" | "user" | "employee" {
  return role.toLowerCase() as "admin" | "user" | "employee";
}

export function toApiStatus(status: AccountStatus): "Active" | "Invited" | "Disabled" {
  const map: Record<AccountStatus, "Active" | "Invited" | "Disabled"> = {
    ACTIVE: "Active",
    INVITED: "Invited",
    DISABLED: "Disabled",
  };
  return map[status];
}

export function parseRole(value: string): UserRole {
  const normalized = value.toUpperCase();
  if (normalized === "ADMIN") return "ADMIN";
  if (normalized === "EMPLOYEE") return "EMPLOYEE";
  return "USER";
}

export function parseStatus(value: string): AccountStatus {
  const normalized = value.toUpperCase();
  if (normalized === "INVITED") return "INVITED";
  if (normalized === "DISABLED") return "DISABLED";
  return "ACTIVE";
}

export function toApiPlatformLanguage(lang: PlatformLanguage): "en" | "rw" | "fr" {
  return lang.toLowerCase() as "en" | "rw" | "fr";
}

export function parsePlatformLanguage(value: string): PlatformLanguage {
  const normalized = value.toUpperCase();
  if (normalized === "RW") return "RW";
  if (normalized === "FR") return "FR";
  return "EN";
}

export function toApiDocumentLanguage(lang: DocumentLanguage): string {
  const map: Record<DocumentLanguage, string> = {
    KINYARWANDA: "Kinyarwanda",
    ENGLISH: "English",
    FRENCH: "French",
  };
  return map[lang];
}

export function parseDocumentLanguage(value: string): DocumentLanguage {
  const normalized = value.trim().toLowerCase();
  if (normalized === "kinyarwanda" || normalized === "rw") return "KINYARWANDA";
  if (normalized === "french" || normalized === "fr") return "FRENCH";
  return "ENGLISH";
}

export function toApiProcessingAction(action: ProcessingAction): string {
  const map: Record<ProcessingAction, string> = {
    SUMMARIZE: "Summarize",
    TRANSLATE: "Translate",
    SUMMARIZE_AND_TRANSLATE: "Summarize + Translate",
  };
  return map[action];
}

export function parseProcessingAction(value: string): ProcessingAction {
  const normalized = value.trim().toLowerCase();
  if (normalized === "summarize") return "SUMMARIZE";
  if (normalized === "translate") return "TRANSLATE";
  return "SUMMARIZE_AND_TRANSLATE";
}

export function parseSummaryLength(value: string): SummaryLength {
  const normalized = value.trim().toUpperCase();
  if (normalized === "SHORT") return "SHORT";
  if (normalized === "DETAILED") return "DETAILED";
  return "MEDIUM";
}

export function toApiDocStatus(status: string): "Processing" | "Completed" | "Failed" {
  if (status === "COMPLETED") return "Completed";
  if (status === "FAILED") return "Failed";
  return "Processing";
}

export function parseValidationAction(value: string): ValidationAction {
  const normalized = value.trim().toLowerCase();
  if (normalized === "reject") return "REJECT";
  if (normalized === "improvement") return "IMPROVEMENT";
  return "APPROVE";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function omitPassword<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _, ...rest } = user;
  return rest;
}
