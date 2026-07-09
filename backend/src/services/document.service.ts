import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error-handler.js";
import { ProcessingOption, DocumentStatus, Role } from "@prisma/client";
import { env } from "../config/env.js";
import { applyDocumentScope } from "../utils/document-scope.js";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

function getReferenceId(doc: { id: string }): string {
  if (doc.id.startsWith("DOC-")) return doc.id;
  return `DOC-${doc.id.slice(-4).toUpperCase()}`;
}

function getOfficeByRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "GovLingua HQ";
    case "EMPLOYEE":
      return "MINALOC HQ";
    default:
      return "Public";
  }
}

async function notifyAIService(payload: {
  documentId: string;
  referenceId: string;
  fileName: string;
  action: string;
  sourceLanguage: string;
  targetLanguage: string;
  summaryLength?: string;
}) {
  try {
    await fetch(`${env.AI_SERVICE_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Fire-and-forget — AI service may not be running during dev
  }
}

function mapAction(action: string): ProcessingOption {
  switch (action) {
    case "summarize":
      return "SUMMARIZE";
    case "translate":
      return "TRANSLATE";
    case "summarize_translate":
      return "SUMMARIZE_TRANSLATE";
    default:
      return "SUMMARIZE";
  }
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function formatDocument(doc: any) {
  let validationStatus = "-";
  if (doc.status === "COMPLETED") {
    if (doc.validations && doc.validations.length > 0) {
      const latestVal = doc.validations[0].validationOption;
      if (latestVal === "APPROVE") validationStatus = "Approved";
      else if (latestVal === "REJECT") validationStatus = "Rejected";
      else if (latestVal === "IMPROVEMENT") validationStatus = "Improvement Requested";
    } else {
      validationStatus = "-";
    }
  }

  return {
    id: getReferenceId(doc),
    dbId: doc.id,
    name: doc.originalName,
    source: doc.sourceLanguage,
    target: doc.targetLanguage,
    action: doc.processingOption === "SUMMARIZE_TRANSLATE"
      ? "Summarize + Translate"
      : doc.processingOption === "SUMMARIZE"
        ? "Summarize"
        : "Translate",
    date: doc.createdAt.toLocaleDateString("en-CA", { timeZone: "Africa/Kigali" }),
    time: doc.createdAt.toLocaleTimeString("en-GB", { timeZone: "Africa/Kigali" }).slice(0, 5),
    status: doc.status === "COMPLETED"
      ? "Completed"
      : doc.status === "PROCESSING"
        ? "Processing"
        : doc.status === "FAILED"
          ? "Failed"
          : "Pending",
    size: formatFileSize(doc.fileSize),
    qualityScore: null,
    processingResult: (doc.summary || doc.translation) ? {
      summary: doc.summary,
      translation: doc.translation,
    } : null,
    user: doc.user ? {
      name: doc.user.name,
      email: doc.user.email,
      role: doc.user.role,
    } : null,
    validationStatus,
  };
}

export async function uploadDocument(data: {
  userId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  sourceLanguage: string;
  targetLanguage: string;
  action: string;
  summaryLength?: string;
}) {
  const document = await prisma.document.create({
    data: {
      documentName: data.fileName,
      originalName: data.originalName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      processingOption: mapAction(data.action),
      status: "PENDING",
      userId: data.userId,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: data.userId,
      action: "DOCUMENT_UPLOAD",
      details: `Uploaded ${data.originalName}`,
      metadata: { documentId: document.id, referenceId: getReferenceId(document) },
    },
  });

  let resolvedSummaryLength = data.summaryLength;
  if (!resolvedSummaryLength) {
    const prefs = await prisma.userPreferences.findUnique({ where: { userId: data.userId } });
    resolvedSummaryLength = prefs?.defaultSummaryLength || "medium";
  }

  notifyAIService({
    documentId: document.id,
    referenceId: getReferenceId(document),
    fileName: data.fileName,
    action: data.action,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
    summaryLength: resolvedSummaryLength,
  });

  return formatDocument(document);
}

export async function submitText(data: {
  userId: string;
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  action: string;
  summaryLength?: string;
}) {
  const textBuffer = Buffer.from(data.text, "utf-8");
  const fileName = `text-${Date.now()}.txt`;

  const uploadDir = resolve(env.UPLOAD_DIR);
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  writeFileSync(join(uploadDir, fileName), textBuffer);

  const document = await prisma.document.create({
    data: {
      documentName: fileName,
      originalName: `Text Input (${data.action})`,
      fileSize: textBuffer.length,
      mimeType: "text/plain",
      sourceType: "TEXT",
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      processingOption: mapAction(data.action),
      status: "PENDING",
      userId: data.userId,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: data.userId,
      action: "TEXT_SUBMIT",
      details: `Submitted text for ${data.action}`,
      metadata: { documentId: document.id, referenceId: getReferenceId(document) },
    },
  });

  let resolvedSummaryLength = data.summaryLength;
  if (!resolvedSummaryLength) {
    const prefs = await prisma.userPreferences.findUnique({ where: { userId: data.userId } });
    resolvedSummaryLength = prefs?.defaultSummaryLength || "medium";
  }

  notifyAIService({
    documentId: document.id,
    referenceId: getReferenceId(document),
    fileName,
    action: data.action,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
    summaryLength: resolvedSummaryLength,
  });

  return formatDocument(document);
}

export async function getDocuments(userId: string, role: Role, params: {
  page?: number;
  limit?: number;
  status?: string;
  action?: string;
  search?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = applyDocumentScope({}, userId, role);

  if (params.status) {
    where.status = params.status.toUpperCase();
  }
  if (params.action) {
    where.processingOption = mapAction(params.action);
  }
  if (params.search) {
    where.OR = [
      { originalName: { contains: params.search, mode: "insensitive" } },
      { id: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, role: true } },
        validations: { select: { validationOption: true }, orderBy: { createdAt: "desc" } }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return {
    documents: documents.map(formatDocument),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getDocumentById(documentId: string, userId: string, role: Role) {
  const document = await prisma.document.findFirst({
    where: applyDocumentScope({ id: documentId }, userId, role),
    include: {
      validations: { include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: "desc" } },
      user: { select: { name: true, email: true, role: true } },
    },
  });

  if (!document) throw new AppError(404, "Document not found");
  
  const formatted = formatDocument(document);
  return {
    ...formatted,
    submittedBy: document.user ? {
      name: document.user.name,
      email: document.user.email,
      office: getOfficeByRole(document.user.role),
    } : null,
    validations: document.validations.map((v) => ({
      id: v.id,
      documentId: v.documentId,
      userId: v.userId,
      action: v.validationOption,
      feedback: v.feedback,
      notes: v.notes,
      createdAt: v.createdAt,
      user: v.user,
    })) || [],
  };
}

export async function updateDocument(documentId: string, userId: string, role: Role, data: {
  sourceLanguage?: string;
  targetLanguage?: string;
  action?: string;
}) {
  const document = await prisma.document.findFirst({
    where: applyDocumentScope({ id: documentId }, userId, role),
  });

  if (!document) throw new AppError(404, "Document not found");
  if (document.status === "PROCESSING") {
    throw new AppError(400, "Cannot update a document that is being processed");
  }

  const updated = await prisma.document.update({
    where: { id: document.id },
    data: {
      ...(data.sourceLanguage && { sourceLanguage: data.sourceLanguage }),
      ...(data.targetLanguage && { targetLanguage: data.targetLanguage }),
      ...(data.action && { processingOption: mapAction(data.action) }),
    },
  });

  return formatDocument(updated);
}

export async function deleteDocument(documentId: string, userId: string, role: Role) {
  const document = await prisma.document.findFirst({
    where: applyDocumentScope({ id: documentId }, userId, role),
  });

  if (!document) throw new AppError(404, "Document not found");

  await prisma.document.delete({ where: { id: document.id } });

  await prisma.activityLog.create({
    data: {
      userId,
      action: "DOCUMENT_DELETE",
      details: `Deleted document ${getReferenceId(document)}`,
    },
  });

  return { message: "Document deleted successfully" };
}

export async function updateProcessingStatus(documentId: string, data: {
  status: string;
  summary?: string;
  translation?: string;
  qualityScore?: number;
}) {
  const document = await prisma.document.findFirst({
    where: { id: documentId },
  });

  if (!document) throw new AppError(404, "Document not found");

  const status = data.status.toUpperCase() as DocumentStatus;

  const updated = await prisma.document.update({
    where: { id: document.id },
    data: {
      status,
      summary: data.summary,
      translation: data.translation,
    },
  });

  return formatDocument(updated);
}

export async function getDocumentContent(documentId: string) {
  const document = await prisma.document.findFirst({
    where: { id: documentId },
  });

  if (!document) throw new AppError(404, "Document not found");

  const filePath = join(resolve(env.UPLOAD_DIR), document.documentName);
  if (!existsSync(filePath)) throw new AppError(404, "File not found on disk");

  const content = readFileSync(filePath);
  return { content, mimeType: document.mimeType, fileName: document.originalName };
}

export async function getHistory(userId: string, role: Role, params: { page?: number; limit?: number }) {
  return getDocuments(userId, role, { ...params, status: "COMPLETED" });
}
