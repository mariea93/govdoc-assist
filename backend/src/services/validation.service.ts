import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error-handler.js";
import { ValidationOption, Role } from "@prisma/client";
import { applyDocumentScope } from "../utils/document-scope.js";

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

function formatValidation(v: any) {
  return {
    id: v.id,
    documentId: v.documentId,
    userId: v.userId,
    action: v.validationOption,
    feedback: v.feedback,
    notes: v.notes,
    createdAt: v.createdAt,
    user: v.user ? {
      id: v.user.id,
      name: v.user.name,
      role: v.user.role,
      office: getOfficeByRole(v.user.role),
    } : null,
  };
}

export async function createValidation(data: {
  documentId: string;
  userId: string;
  role: Role;
  action?: string;
  feedback?: string;
  notes?: string;
}) {
  const document = await prisma.document.findFirst({
    where: applyDocumentScope({ id: data.documentId }, data.userId, data.role),
  });

  if (!document) throw new AppError(404, "Document not found");
  if (document.status !== "COMPLETED") {
    throw new AppError(400, "Can only validate completed documents");
  }

  // Handle comment-only save: action is not provided, feedback is provided
  if (!data.action && data.feedback !== undefined) {
    const existingValidation = await prisma.validation.findFirst({
      where: {
        documentId: document.id,
        userId: data.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!existingValidation) {
      throw new AppError(400, "Please select Approve, Reject, or Request Improvement before saving a comment.");
    }

    const updated = await prisma.validation.update({
      where: { id: existingValidation.id },
      data: {
        feedback: data.feedback,
      },
      include: { user: { select: { id: true, name: true, role: true } } },
    });

    return formatValidation(updated);
  }

  const actionMap: Record<string, ValidationOption> = {
    approve: "APPROVE",
    reject: "REJECT",
    improvement: "IMPROVEMENT",
  };

  const validation = await prisma.validation.create({
    data: {
      documentId: document.id,
      userId: data.userId,
      validationOption: actionMap[data.action!] || "APPROVE",
      feedback: data.feedback,
      notes: data.notes,
    },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  await prisma.activityLog.create({
    data: {
      userId: data.userId,
      action: "VALIDATION",
      details: `${data.action} document ${getReferenceId(document)}`,
      metadata: { documentId: document.id, validationAction: data.action },
    },
  });

  return formatValidation(validation);
}

export async function getValidations(documentId: string, userId: string, role: Role) {
  const document = await prisma.document.findFirst({
    where: applyDocumentScope({ id: documentId }, userId, role),
  });

  if (!document) throw new AppError(404, "Document not found");

  const validations = await prisma.validation.findMany({
    where: { documentId: document.id },
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return validations.map(formatValidation);
}

export async function addValidationNote(data: {
  documentId: string;
  userId: string;
  role: Role;
  notes: string;
}) {
  const document = await prisma.document.findFirst({
    where: applyDocumentScope({ id: data.documentId }, data.userId, data.role),
  });

  if (!document) throw new AppError(404, "Document not found");

  const validation = await prisma.validation.create({
    data: {
      documentId: document.id,
      userId: data.userId,
      validationOption: "IMPROVEMENT",
      notes: data.notes,
    },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  return formatValidation(validation);
}

export async function getDocumentsForReview(userId: string, role: Role, params: { page?: number; limit?: number }) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  let where: any;
  if (role === "EMPLOYEE") {
    where = {
      status: "COMPLETED" as const,
      OR: [
        { userId },
        { validations: { some: { userId } } }
      ]
    };
  } else {
    where = applyDocumentScope({ status: "COMPLETED" as const }, userId, role);
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        validations: { include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return {
    documents: documents.map((doc) => ({
      id: getReferenceId(doc),
      dbId: doc.id,
      name: doc.originalName,
      source: doc.sourceLanguage,
      target: doc.targetLanguage,
      action: doc.processingOption === "SUMMARIZE_TRANSLATE"
        ? "Summarize + Translate"
        : doc.processingOption === "SUMMARIZE" ? "Summarize" : "Translate",
      date: doc.createdAt.toISOString().split("T")[0],
      status: "Completed",
      size: doc.fileSize >= 1024 * 1024
        ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
        : `${(doc.fileSize / 1024).toFixed(0)} KB`,
      qualityScore: null,
      submittedBy: doc.user ? {
        id: doc.user.id,
        name: doc.user.name,
        email: doc.user.email,
        office: getOfficeByRole(doc.user.role),
      } : null,
      processingResult: (doc.summary || doc.translation) ? {
        summary: doc.summary,
        translation: doc.translation,
      } : null,
      validations: doc.validations.map(formatValidation),
      validated: doc.validations.length > 0,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
