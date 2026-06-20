import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error-handler.js";
import { ValidationAction } from "@prisma/client";

export async function createValidation(data: {
  documentId: string;
  userId: string;
  action: string;
  feedback?: string;
  notes?: string;
}) {
  const document = await prisma.document.findFirst({
    where: { OR: [{ id: data.documentId }, { referenceId: data.documentId }] },
  });

  if (!document) throw new AppError(404, "Document not found");
  if (document.status !== "COMPLETED") {
    throw new AppError(400, "Can only validate completed documents");
  }

  const actionMap: Record<string, ValidationAction> = {
    approve: "APPROVE",
    reject: "REJECT",
    improvement: "IMPROVEMENT",
  };

  const validation = await prisma.validationRecord.create({
    data: {
      documentId: document.id,
      userId: data.userId,
      action: actionMap[data.action] || "APPROVE",
      feedback: data.feedback,
      notes: data.notes,
    },
    include: { user: { select: { name: true } } },
  });

  await prisma.activityLog.create({
    data: {
      userId: data.userId,
      action: "VALIDATION",
      details: `${data.action} document ${document.referenceId}`,
      metadata: { documentId: document.id, validationAction: data.action },
    },
  });

  return validation;
}

export async function getValidations(documentId: string) {
  const document = await prisma.document.findFirst({
    where: { OR: [{ id: documentId }, { referenceId: documentId }] },
  });

  if (!document) throw new AppError(404, "Document not found");

  return prisma.validationRecord.findMany({
    where: { documentId: document.id },
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function addValidationNote(data: {
  documentId: string;
  userId: string;
  notes: string;
}) {
  const document = await prisma.document.findFirst({
    where: { OR: [{ id: data.documentId }, { referenceId: data.documentId }] },
  });

  if (!document) throw new AppError(404, "Document not found");

  return prisma.validationRecord.create({
    data: {
      documentId: document.id,
      userId: data.userId,
      action: "IMPROVEMENT",
      notes: data.notes,
    },
    include: { user: { select: { name: true } } },
  });
}

export async function getDocumentsForReview(userId: string, params: { page?: number; limit?: number }) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where: { status: "COMPLETED" },
      include: {
        processingResult: true,
        user: { select: { name: true, email: true, office: true } },
        validations: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.document.count({ where: { status: "COMPLETED" } }),
  ]);

  return {
    documents: documents.map((doc) => ({
      id: doc.referenceId,
      dbId: doc.id,
      name: doc.originalName,
      source: doc.sourceLanguage,
      target: doc.targetLanguage,
      action: doc.action === "SUMMARIZE_TRANSLATE"
        ? "Summarize + Translate"
        : doc.action === "SUMMARIZE" ? "Summarize" : "Translate",
      date: doc.createdAt.toISOString().split("T")[0],
      status: "Completed",
      size: doc.fileSize >= 1024 * 1024
        ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
        : `${(doc.fileSize / 1024).toFixed(0)} KB`,
      qualityScore: doc.qualityScore,
      submittedBy: doc.user,
      processingResult: doc.processingResult,
      validations: doc.validations,
      validated: doc.validations.length > 0,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
