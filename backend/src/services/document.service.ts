import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error-handler.js";
import { DocumentAction, DocumentStatus, Role } from "@prisma/client";
import { env } from "../config/env.js";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

function generateReferenceId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DOC-${num}`;
}

async function notifyAIService(payload: {
  documentId: string;
  referenceId: string;
  fileName: string;
  action: string;
  sourceLanguage: string;
  targetLanguage: string;
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

function mapAction(action: string): DocumentAction {
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
  return {
    id: doc.referenceId,
    dbId: doc.id,
    name: doc.originalName,
    source: doc.sourceLanguage,
    target: doc.targetLanguage,
    action: doc.action === "SUMMARIZE_TRANSLATE"
      ? "Summarize + Translate"
      : doc.action === "SUMMARIZE"
        ? "Summarize"
        : "Translate",
    date: doc.createdAt.toISOString().split("T")[0],
    status: doc.status === "COMPLETED"
      ? "Completed"
      : doc.status === "PROCESSING"
        ? "Processing"
        : doc.status === "FAILED"
          ? "Failed"
          : "Pending",
    size: formatFileSize(doc.fileSize),
    qualityScore: doc.qualityScore,
    processingResult: doc.processingResult || null,
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
}) {
  let referenceId = generateReferenceId();
  const existing = await prisma.document.findUnique({ where: { referenceId } });
  if (existing) referenceId = generateReferenceId();

  const document = await prisma.document.create({
    data: {
      referenceId,
      fileName: data.fileName,
      originalName: data.originalName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      action: mapAction(data.action),
      status: "PENDING",
      userId: data.userId,
    },
    include: { processingResult: true },
  });

  await prisma.activityLog.create({
    data: {
      userId: data.userId,
      action: "DOCUMENT_UPLOAD",
      details: `Uploaded ${data.originalName}`,
      metadata: { documentId: document.id, referenceId },
    },
  });

  notifyAIService({
    documentId: document.id,
    referenceId,
    fileName: data.fileName,
    action: data.action,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
  });

  return formatDocument(document);
}

export async function submitText(data: {
  userId: string;
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  action: string;
}) {
  let referenceId = generateReferenceId();
  const existing = await prisma.document.findUnique({ where: { referenceId } });
  if (existing) referenceId = generateReferenceId();

  const textBuffer = Buffer.from(data.text, "utf-8");
  const fileName = `text-${Date.now()}.txt`;

  const uploadDir = resolve(env.UPLOAD_DIR);
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  writeFileSync(join(uploadDir, fileName), textBuffer);

  const document = await prisma.document.create({
    data: {
      referenceId,
      fileName,
      originalName: `Text Input (${data.action})`,
      fileSize: textBuffer.length,
      mimeType: "text/plain",
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      action: mapAction(data.action),
      status: "PENDING",
      userId: data.userId,
    },
    include: { processingResult: true },
  });

  await prisma.activityLog.create({
    data: {
      userId: data.userId,
      action: "TEXT_SUBMIT",
      details: `Submitted text for ${data.action}`,
      metadata: { documentId: document.id, referenceId },
    },
  });

  notifyAIService({
    documentId: document.id,
    referenceId,
    fileName,
    action: data.action,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
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

  const where: any = {};

  if (role === "USER") {
    where.userId = userId;
  }

  if (params.status) {
    where.status = params.status.toUpperCase();
  }
  if (params.action) {
    where.action = mapAction(params.action);
  }
  if (params.search) {
    where.OR = [
      { originalName: { contains: params.search, mode: "insensitive" } },
      { referenceId: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: { processingResult: true, user: { select: { name: true, email: true } } },
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
    where: {
      OR: [{ id: documentId }, { referenceId: documentId }],
      ...(role === "USER" ? { userId } : {}),
    },
    include: {
      processingResult: true,
      validations: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      user: { select: { name: true, email: true, office: true } },
    },
  });

  if (!document) throw new AppError(404, "Document not found");
  return formatDocument(document);
}

export async function updateDocument(documentId: string, userId: string, role: Role, data: {
  sourceLanguage?: string;
  targetLanguage?: string;
  action?: string;
}) {
  const document = await prisma.document.findFirst({
    where: {
      OR: [{ id: documentId }, { referenceId: documentId }],
      ...(role === "USER" ? { userId } : {}),
    },
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
      ...(data.action && { action: mapAction(data.action) }),
    },
    include: { processingResult: true },
  });

  return formatDocument(updated);
}

export async function deleteDocument(documentId: string, userId: string, role: Role) {
  const document = await prisma.document.findFirst({
    where: {
      OR: [{ id: documentId }, { referenceId: documentId }],
      ...(role === "USER" ? { userId } : {}),
    },
  });

  if (!document) throw new AppError(404, "Document not found");

  await prisma.document.delete({ where: { id: document.id } });

  await prisma.activityLog.create({
    data: {
      userId,
      action: "DOCUMENT_DELETE",
      details: `Deleted document ${document.referenceId}`,
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
    where: { OR: [{ id: documentId }, { referenceId: documentId }] },
  });

  if (!document) throw new AppError(404, "Document not found");

  const status = data.status.toUpperCase() as DocumentStatus;

  await prisma.document.update({
    where: { id: document.id },
    data: { status, qualityScore: data.qualityScore },
  });

  if (data.summary || data.translation) {
    await prisma.processingResult.upsert({
      where: { documentId: document.id },
      create: {
        documentId: document.id,
        summary: data.summary,
        translation: data.translation,
      },
      update: {
        summary: data.summary,
        translation: data.translation,
        generatedAt: new Date(),
      },
    });
  }

  const updated = await prisma.document.findUnique({
    where: { id: document.id },
    include: { processingResult: true },
  });

  return formatDocument(updated);
}

export async function getDocumentContent(documentId: string) {
  const document = await prisma.document.findFirst({
    where: { OR: [{ id: documentId }, { referenceId: documentId }] },
  });

  if (!document) throw new AppError(404, "Document not found");

  const filePath = join(resolve(env.UPLOAD_DIR), document.fileName);
  if (!existsSync(filePath)) throw new AppError(404, "File not found on disk");

  const content = readFileSync(filePath);
  return { content, mimeType: document.mimeType, fileName: document.originalName };
}

export async function getHistory(userId: string, role: Role, params: { page?: number; limit?: number }) {
  return getDocuments(userId, role, { ...params, status: "COMPLETED" });
}
