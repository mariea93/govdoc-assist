import type { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import { toApiDocStatus } from "../utils/mappers.js";

export async function getDashboard(userId: number, role: UserRole) {
  const docWhere = role === "ADMIN" ? {} : { userId };

  const [documentsProcessed, summariesGenerated, translationsGenerated, recentDocuments] =
    await Promise.all([
      prisma.document.count({ where: docWhere }),
      prisma.document.count({
        where: {
          ...docWhere,
          action: { in: ["SUMMARIZE", "SUMMARIZE_AND_TRANSLATE"] },
          status: "COMPLETED",
        },
      }),
      prisma.document.count({
        where: {
          ...docWhere,
          action: { in: ["TRANSLATE", "SUMMARIZE_AND_TRANSLATE"] },
          status: "COMPLETED",
        },
      }),
      prisma.document.findMany({
        where: docWhere,
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          referenceId: true,
          fileName: true,
          action: true,
          sourceLanguage: true,
          targetLanguage: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  if (role === "ADMIN") {
    const totalUsers = await prisma.user.count();
    return {
      role: "admin",
      stats: {
        totalUsers,
        documentsProcessed,
        summariesGenerated,
        translationsGenerated,
      },
      recentDocuments,
    };
  }

  if (role === "EMPLOYEE") {
    const validations = await prisma.validationRecord.count({ where: { userId } });
    return {
      role: "employee",
      stats: {
        documentsProcessed,
        summariesGenerated,
        translationsGenerated,
        validations,
        timeSavedHours: Math.round(documentsProcessed * 0.5),
      },
      recentDocuments,
    };
  }

  return {
    role: "user",
    stats: {
      documentsProcessed,
      summariesGenerated,
      translationsGenerated,
      timeSavedHours: Math.round(documentsProcessed * 0.75),
    },
    recentDocuments,
  };
}

export async function getWeeklyActivity(userId: number, role: UserRole) {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const documents = await prisma.document.findMany({
    where: {
      ...(role === "ADMIN" ? {} : { userId }),
      createdAt: { gte: since },
    },
    select: { createdAt: true, action: true },
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chart = days.map((day) => ({
    day,
    documents: 0,
    summaries: 0,
    translations: 0,
    validations: 0,
  }));

  for (const doc of documents) {
    const dayIndex = doc.createdAt.getDay();
    chart[dayIndex].documents += 1;
    if (doc.action === "SUMMARIZE" || doc.action === "SUMMARIZE_AND_TRANSLATE") {
      chart[dayIndex].summaries += 1;
    }
    if (doc.action === "TRANSLATE" || doc.action === "SUMMARIZE_AND_TRANSLATE") {
      chart[dayIndex].translations += 1;
    }
  }

  return chart;
}

export async function listReports() {
  return prisma.report.findMany({ orderBy: { generatedAt: "desc" } });
}

export async function getReport(id: string) {
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw new NotFoundError("Report not found");
  return {
    ...report,
    status: toApiDocStatus(report.status),
  };
}

export async function createReport(data: {
  reportName: string;
  period: string;
  status: string;
}) {
  const statusMap = {
    Processing: "PROCESSING",
    Completed: "COMPLETED",
    Failed: "FAILED",
  } as const;

  return prisma.report.create({
    data: {
      reportName: data.reportName,
      period: data.period,
      status: statusMap[data.status as keyof typeof statusMap] ?? "COMPLETED",
    },
  });
}

export async function updateReport(
  id: string,
  data: { reportName?: string; period?: string; status?: string },
) {
  const statusMap = {
    Processing: "PROCESSING",
    Completed: "COMPLETED",
    Failed: "FAILED",
  } as const;

  return prisma.report.update({
    where: { id },
    data: {
      reportName: data.reportName,
      period: data.period,
      status: data.status ? statusMap[data.status as keyof typeof statusMap] : undefined,
    },
  });
}

export async function deleteReport(id: string) {
  await prisma.report.delete({ where: { id } });
  return { success: true };
}

export async function getAnalyticsSummary() {
  const [totalDocuments, totalSummaries, totalTranslations, activeUsers] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({
      where: { action: { in: ["SUMMARIZE", "SUMMARIZE_AND_TRANSLATE"] }, status: "COMPLETED" },
    }),
    prisma.document.count({
      where: { action: { in: ["TRANSLATE", "SUMMARIZE_AND_TRANSLATE"] }, status: "COMPLETED" },
    }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
  ]);

  return {
    totalDocuments,
    totalSummaries,
    totalTranslations,
    activeUsers,
  };
}

export async function getLanguageDistribution() {
  const docs = await prisma.document.groupBy({
    by: ["targetLanguage"],
    _count: { targetLanguage: true },
  });

  const colors: Record<string, string> = {
    KINYARWANDA: "#2f6b4f",
    ENGLISH: "#163a5f",
    FRENCH: "#c9a227",
  };

  return docs.map((entry) => ({
    name: entry.targetLanguage,
    value: entry._count.targetLanguage,
    color: colors[entry.targetLanguage] ?? "#64748b",
  }));
}
