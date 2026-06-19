import type { DocStatus, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import {
  formatDate,
  formatFileSize,
  parseDocumentLanguage,
  parseProcessingAction,
  parseSummaryLength,
  toApiDocStatus,
  toApiDocumentLanguage,
  toApiProcessingAction,
} from "../utils/mappers.js";
import * as activityLogService from "./activityLog.service.js";

async function nextReferenceId(): Promise<string> {
  const count = await prisma.document.count();
  return `DOC-${2042 + count}`;
}

function serializeDocument(doc: {
  id: string;
  referenceId: string;
  fileName: string;
  fileSizeBytes: number;
  sourceLanguage: import("@prisma/client").DocumentLanguage;
  targetLanguage: import("@prisma/client").DocumentLanguage;
  action: import("@prisma/client").ProcessingAction;
  status: DocStatus;
  qualityScore: number | null;
  createdAt: Date;
  result?: {
    summary: string | null;
    translation: string | null;
    summaryLanguage: import("@prisma/client").DocumentLanguage | null;
    translationLanguage: import("@prisma/client").DocumentLanguage | null;
  } | null;
}) {
  return {
    id: doc.referenceId,
    documentId: doc.id,
    name: doc.fileName,
    source: toApiDocumentLanguage(doc.sourceLanguage),
    target: toApiDocumentLanguage(doc.targetLanguage),
    action: toApiProcessingAction(doc.action),
    date: formatDate(doc.createdAt),
    status: toApiDocStatus(doc.status),
    size: formatFileSize(doc.fileSizeBytes),
    qualityScore: doc.qualityScore,
    summary: doc.result?.summary ?? null,
    translation: doc.result?.translation ?? null,
  };
}

function parseDocStatus(status: string): DocStatus {
  if (status === "Completed") return "COMPLETED";
  if (status === "Failed") return "FAILED";
  return "PROCESSING";
}

export async function createDocument(
  userId: number,
  data: {
    fileName: string;
    filePath?: string;
    mimeType?: string;
    fileSizeBytes: number;
    sourceLanguage: string;
    targetLanguage: string;
    action: string;
    summaryLength?: string;
  },
) {
  const referenceId = await nextReferenceId();
  const action = parseProcessingAction(data.action === "both" ? "both" : data.action);

  const document = await prisma.document.create({
    data: {
      referenceId,
      userId,
      fileName: data.fileName,
      filePath: data.filePath,
      mimeType: data.mimeType,
      fileSizeBytes: data.fileSizeBytes,
      sourceLanguage: parseDocumentLanguage(data.sourceLanguage),
      targetLanguage: parseDocumentLanguage(data.targetLanguage),
      action,
      summaryLength: data.summaryLength ? parseSummaryLength(data.summaryLength) : undefined,
      status: "PROCESSING",
      result: { create: {} },
    },
    include: { result: true },
  });

  await activityLogService.create({
    userId,
    userName: (await prisma.user.findUnique({ where: { id: userId } }))?.name ?? "User",
    action: `Uploaded document: ${data.fileName}`,
    status: "COMPLETED",
  });

  return serializeDocument(document);
}

export async function createTextDocument(
  userId: number,
  data: {
    fileName: string;
    sourceLanguage: string;
    targetLanguage?: string;
    action: "SUMMARIZE" | "TRANSLATE";
    summaryLength?: string;
    textPreview?: string;
  },
) {
  const referenceId = await nextReferenceId();

  const document = await prisma.document.create({
    data: {
      referenceId,
      userId,
      fileName: data.fileName,
      fileSizeBytes: data.textPreview?.length ?? 0,
      sourceLanguage: parseDocumentLanguage(data.sourceLanguage),
      targetLanguage: parseDocumentLanguage(data.targetLanguage ?? data.sourceLanguage),
      action: data.action,
      summaryLength: data.summaryLength ? parseSummaryLength(data.summaryLength) : undefined,
      status: "PROCESSING",
      result: { create: {} },
    },
    include: { result: true },
  });

  return serializeDocument(document);
}

export async function listDocuments(
  userId: number,
  role: UserRole,
  query: { search?: string; language?: string; action?: string; page: number; limit: number },
) {
  const where: Record<string, unknown> = {};

  if (role !== "ADMIN") {
    where.userId = userId;
  }

  if (query.search) {
    where.fileName = { contains: query.search, mode: "insensitive" };
  }

  if (query.language && query.language !== "all") {
    const lang = parseDocumentLanguage(query.language);
    where.OR = [{ sourceLanguage: lang }, { targetLanguage: lang }];
  }

  if (query.action && query.action !== "all") {
    where.action = parseProcessingAction(
      query.action === "Summarize + Translate" ? "both" : query.action.toLowerCase(),
    );
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: { result: true },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.document.count({ where }),
  ]);

  return {
    documents: documents.map(serializeDocument),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getDocumentById(id: string, userId: number, role: UserRole) {
  const document = await prisma.document.findFirst({
    where: {
      OR: [{ id }, { referenceId: id }],
    },
    include: { result: true, validations: { orderBy: { createdAt: "desc" } } },
  });

  if (!document) throw new NotFoundError("Document not found");
  if (role !== "ADMIN" && document.userId !== userId) {
    throw new ForbiddenError("You do not have access to this document");
  }

  return {
    ...serializeDocument(document),
    validations: document.validations,
  };
}

export async function updateDocument(
  id: string,
  data: { status?: string; qualityScore?: number },
) {
  const document = await prisma.document.findFirst({
    where: { OR: [{ id }, { referenceId: id }] },
  });
  if (!document) throw new NotFoundError("Document not found");

  const updated = await prisma.document.update({
    where: { id: document.id },
    data: {
      status: data.status ? parseDocStatus(data.status) : undefined,
      qualityScore: data.qualityScore,
      completedAt: data.status === "Completed" ? new Date() : undefined,
    },
    include: { result: true },
  });

  return serializeDocument(updated);
}

export async function updateProcessingResult(
  id: string,
  data: {
    summary?: string;
    translation?: string;
    summaryLanguage?: string;
    translationLanguage?: string;
    status?: string;
    qualityScore?: number;
  },
) {
  const document = await prisma.document.findFirst({
    where: { OR: [{ id }, { referenceId: id }] },
  });
  if (!document) throw new NotFoundError("Document not found");

  const [updatedDoc] = await prisma.$transaction([
    prisma.processingResult.upsert({
      where: { documentId: document.id },
      create: {
        documentId: document.id,
        summary: data.summary,
        translation: data.translation,
        summaryLanguage: data.summaryLanguage ? parseDocumentLanguage(data.summaryLanguage) : undefined,
        translationLanguage: data.translationLanguage
          ? parseDocumentLanguage(data.translationLanguage)
          : undefined,
        generatedAt: new Date(),
      },
      update: {
        summary: data.summary,
        translation: data.translation,
        summaryLanguage: data.summaryLanguage ? parseDocumentLanguage(data.summaryLanguage) : undefined,
        translationLanguage: data.translationLanguage
          ? parseDocumentLanguage(data.translationLanguage)
          : undefined,
        generatedAt: new Date(),
      },
    }),
    prisma.document.update({
      where: { id: document.id },
      data: {
        status: data.status ? parseDocStatus(data.status) : "COMPLETED",
        qualityScore: data.qualityScore,
        completedAt: new Date(),
      },
      include: { result: true },
    }),
  ]);

  const full = await prisma.document.findUnique({
    where: { id: document.id },
    include: { result: true },
  });

  return serializeDocument(full!);
}

export async function deleteDocument(id: string, userId: number, role: UserRole) {
  const document = await prisma.document.findFirst({
    where: { OR: [{ id }, { referenceId: id }] },
  });
  if (!document) throw new NotFoundError("Document not found");
  if (role !== "ADMIN" && document.userId !== userId) {
    throw new ForbiddenError("You do not have access to this document");
  }

  await prisma.document.delete({ where: { id: document.id } });
  return { success: true };
}

export async function saveToHistory(id: string, userId: number) {
  const document = await getDocumentById(id, userId, "USER");
  await activityLogService.create({
    userId,
    userName: (await prisma.user.findUnique({ where: { id: userId } }))?.name ?? "User",
    action: `Saved document to history: ${document.name}`,
    status: "COMPLETED",
  });
  return document;
}
