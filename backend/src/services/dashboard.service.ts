import { prisma } from "../config/database.js";
import { Role } from "@prisma/client";
import { applyDocumentScope } from "../utils/document-scope.js";

function getReferenceId(doc: { id: string }): string {
  if (doc.id.startsWith("DOC-")) return doc.id;
  return `DOC-${doc.id.slice(-4).toUpperCase()}`;
}

export async function getDashboardStats(userId: string, role: Role) {
  const userFilter = applyDocumentScope({}, userId, role);

  const [totalDocuments, completed, processing, failed] = await Promise.all([
    prisma.document.count({ where: userFilter }),
    prisma.document.count({ where: { ...userFilter, status: "COMPLETED" } }),
    prisma.document.count({ where: { ...userFilter, status: "PROCESSING" } }),
    prisma.document.count({ where: { ...userFilter, status: "FAILED" } }),
  ]);

  const recentDocuments = await prisma.document.findMany({
    where: userFilter,
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const actionCounts = await prisma.document.groupBy({
    by: ["processingOption"],
    where: userFilter,
    _count: { id: true },
  });

  const languageCounts = await prisma.document.groupBy({
    by: ["targetLanguage"],
    where: userFilter,
    _count: { id: true },
  });

  let pendingValidations = 0;
  if (role === "EMPLOYEE") {
    const completedDocs = await prisma.document.findMany({
      where: { ...userFilter, status: "COMPLETED" },
      select: { id: true, validations: { select: { id: true } } },
    });
    pendingValidations = completedDocs.filter((d) => d.validations.length === 0).length;
  } else if (role === "ADMIN") {
    const completedDocs = await prisma.document.findMany({
      where: { status: "COMPLETED" },
      select: { id: true, validations: { select: { id: true } } },
    });
    pendingValidations = completedDocs.filter((d) => d.validations.length === 0).length;
  }

  let totalUsers = 0;
  if (role === "ADMIN") {
    totalUsers = await prisma.user.count();
  }

  return {
    totalDocuments,
    completed,
    processing,
    failed,
    pendingValidations,
    totalUsers,
    recentDocuments: recentDocuments.map((doc) => ({
      id: getReferenceId(doc),
      dbId: doc.id,
      name: doc.originalName,
      source: doc.sourceLanguage,
      target: doc.targetLanguage,
      action: doc.processingOption === "SUMMARIZE_TRANSLATE"
        ? "Summarize + Translate"
        : doc.processingOption === "SUMMARIZE" ? "Summarize" : "Translate",
      date: doc.createdAt.toISOString().split("T")[0],
      status: doc.status === "COMPLETED" ? "Completed"
        : doc.status === "PROCESSING" ? "Processing"
          : doc.status === "FAILED" ? "Failed" : "Pending",
    })),
    actionBreakdown: actionCounts.map((a) => ({
      action: a.processingOption === "SUMMARIZE_TRANSLATE"
        ? "Summarize + Translate"
        : a.processingOption === "SUMMARIZE" ? "Summarize" : "Translate",
      count: a._count?.id || 0,
    })),
    languageBreakdown: languageCounts.map((l) => ({
      language: l.targetLanguage,
      count: l._count?.id || 0,
    })),
  };
}

export async function getWeeklyActivity(userId: string, role: Role) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const userFilter = applyDocumentScope({}, userId, role);

  const documents = await prisma.document.findMany({
    where: { ...userFilter, createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, status: true },
    orderBy: { createdAt: "asc" },
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const activity = days.map((day) => ({ day, uploads: 0, completed: 0 }));

  documents.forEach((doc) => {
    const dayIndex = doc.createdAt.getDay();
    activity[dayIndex].uploads++;
    if (doc.status === "COMPLETED") {
      activity[dayIndex].completed++;
    }
  });

  return activity;
}
