import type { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/errors.js";
import { parseValidationAction } from "../utils/mappers.js";
import * as activityLogService from "./activityLog.service.js";

export async function createValidation(
  documentId: string,
  userId: number,
  role: UserRole,
  data: { action: string; feedback?: string; notes?: string },
) {
  const document = await prisma.document.findFirst({
    where: { OR: [{ id: documentId }, { referenceId: documentId }] },
  });
  if (!document) throw new NotFoundError("Document not found");

  if (role === "USER" && document.userId !== userId) {
    throw new ForbiddenError("You do not have access to this document");
  }

  const validation = await prisma.validationRecord.create({
    data: {
      documentId: document.id,
      userId,
      action: parseValidationAction(data.action),
      feedback: data.feedback,
      notes: data.notes,
    },
  });

  const statusMap = {
    APPROVE: "APPROVED",
    REJECT: "FAILED",
    IMPROVEMENT: "COMPLETED",
  } as const;

  await activityLogService.create({
    userId,
    userName: (await prisma.user.findUnique({ where: { id: userId } }))?.name ?? "User",
    action: `${data.action} validation for document: ${document.fileName}`,
    status: statusMap[validation.action],
  });

  return validation;
}

export async function listValidations(documentId: string, userId: number, role: UserRole) {
  const document = await prisma.document.findFirst({
    where: { OR: [{ id: documentId }, { referenceId: documentId }] },
  });
  if (!document) throw new NotFoundError("Document not found");

  if (role !== "ADMIN" && document.userId !== userId && role !== "EMPLOYEE") {
    throw new ForbiddenError();
  }

  return prisma.validationRecord.findMany({
    where: { documentId: document.id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
}

export async function saveValidationNote(documentId: string, userId: number, notes: string) {
  if (!notes.trim()) {
    throw new BadRequestError("Please add a note before saving", "note_required");
  }

  return createValidation(documentId, userId, "EMPLOYEE", {
    action: "improvement",
    notes,
  });
}
