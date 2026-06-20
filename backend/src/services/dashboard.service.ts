import { prisma } from "../config/database.js";
import { Role } from "@prisma/client";

export async function getDashboardStats(userId: string, role: Role) {
  const userFilter = role === "USER" ? { userId } : {};

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
    include: { processingResult: true },
  });

  const actionCounts = await prisma.document.groupBy({
    by: ["action"],
    where: userFilter,
    _count: { id: true },
  });

  const languageCounts = await prisma.document.groupBy({
    by: ["targetLanguage"],
    where: userFilter,
    _count: { id: true },
  });

  let pendingValidations = 0;
  if (role === "EMPLOYEE" || role === "ADMIN") {
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
      id: doc.referenceId,
      name: doc.originalName,
      source: doc.sourceLanguage,
      target: doc.targetLanguage,
      action: doc.action === "SUMMARIZE_TRANSLATE"
        ? "Summarize + Translate"
        : doc.action === "SUMMARIZE" ? "Summarize" : "Translate",
      date: doc.createdAt.toISOString().split("T")[0],
      status: doc.status === "COMPLETED" ? "Completed"
        : doc.status === "PROCESSING" ? "Processing"
          : doc.status === "FAILED" ? "Failed" : "Pending",
    })),
    actionBreakdown: actionCounts.map((a) => ({
      action: a.action,
      count: a._count.id,
    })),
    languageBreakdown: languageCounts.map((l) => ({
      language: l.targetLanguage,
      count: l._count.id,
    })),
  };
}

export async function getWeeklyActivity(userId: string, role: Role) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const userFilter = role === "USER" ? { userId } : {};

  const documents = await prisma.document.findMany({
    where: { ...userFilter, createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, action: true, status: true },
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
