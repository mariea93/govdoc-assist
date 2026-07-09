import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error-handler.js";
import { Role, UserStatus, ReportStatus } from "@prisma/client";

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

export async function getUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.role) where.role = params.role.toUpperCase();
  if (params.status) where.status = params.status.toUpperCase();
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { documents: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      office: getOfficeByRole(u.role),
      status: u.status,
      createdAt: u.createdAt,
      documentCount: u._count.documents,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { documents: true, validations: true } },
    },
  });
  if (!user) throw new AppError(404, "User not found");
  return {
    ...user,
    office: getOfficeByRole(user.role),
  };
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
  office?: string;
}) {
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      passwordHash,
      role: data.role,
      preferences: { create: {} },
    },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "ADMIN_CREATE_USER",
      details: `Account created by admin with role ${user.role}`,
    },
  });

  return {
    ...user,
    office: getOfficeByRole(user.role),
  };
}

export async function updateUser(userId: string, data: {
  name?: string;
  email?: string;
  role?: Role;
  office?: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, "Email already in use");
  }

  const { office, ...updateData } = data;
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  return {
    ...updatedUser,
    office: getOfficeByRole(updatedUser.role),
  };
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  return {
    ...updatedUser,
    office: getOfficeByRole(updatedUser.role),
  };
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");
  await prisma.user.delete({ where: { id: userId } });
  return { message: "User deleted successfully" };
}

export async function getSystemSettings() {
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: {} });
  }
  return {
    ...settings,
    enableEmailNotification: settings.enableInAppNotification,
  };
}

export async function updateSystemSettings(data: {
  organizationName?: string;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
  maxFileSize?: number;
  allowedFileTypes?: string;
  minPasswordLength?: number;
  requireSpecialChar?: boolean;
  sessionTimeout?: number;
  enableEmailNotification?: boolean;
  enableProcessingAlerts?: boolean;
  maintenanceMode?: boolean;
}) {
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: {} });
  }

  const prismaData: any = { ...data };
  if (data.enableEmailNotification !== undefined) {
    prismaData.enableInAppNotification = data.enableEmailNotification;
    delete prismaData.enableEmailNotification;
  }

  const updated = await prisma.systemSettings.update({
    where: { id: settings.id },
    data: prismaData,
  });

  return {
    ...updated,
    enableEmailNotification: updated.enableInAppNotification,
  };
}

export async function getActivityLog(params: { page?: number; limit?: number; userId?: string }) {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.userId) where.userId = params.userId;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ]);

  const mappedLogs = await Promise.all(
    logs.map(async (log) => {
      let comment = "-";
      if (log.action === "VALIDATION" && log.metadata && typeof log.metadata === "object") {
        const metadata = log.metadata as Record<string, any>;
        const documentId = metadata.documentId;
        if (documentId) {
          const val = await prisma.validation.findFirst({
            where: {
              documentId,
              userId: log.userId,
            },
            orderBy: { createdAt: "desc" },
            select: { feedback: true, notes: true },
          });
          if (val) {
            comment = val.feedback || val.notes || "-";
          }
        }
      }
      return {
        ...log,
        comment,
      };
    })
  );

  return { logs: mappedLogs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getReports(params: { page?: number; limit?: number; status?: string }) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.status) where.status = params.status.toUpperCase();

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return { reports, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function createReport(data: { reportName: string; period: string; type?: string; createdBy: string }) {
  const fileName = `report-${Date.now()}.txt`;
  const uploadDir = path.resolve(env.UPLOAD_DIR);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const fullPath = path.join(uploadDir, fileName);
  const content = `Report Name: ${data.reportName}\nPeriod: ${data.period}\nGenerated At: ${new Date().toISOString()}\nCreated By: ${data.createdBy}\n`;
  fs.writeFileSync(fullPath, content);

  return prisma.report.create({
    data: {
      reportName: data.reportName,
      period: data.period,
      status: "DRAFT" as ReportStatus,
      filePath: fileName,
      createdBy: data.createdBy,
    },
    include: { user: { select: { name: true } } },
  });
}

export async function updateReport(reportId: string, data: { reportName?: string; status?: string; content?: any }) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError(404, "Report not found");

  const updateData: any = {};
  if (data.reportName) updateData.reportName = data.reportName;
  if (data.status) updateData.status = data.status.toUpperCase();

  return prisma.report.update({ where: { id: reportId }, data: updateData });
}

export async function deleteReport(reportId: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError(404, "Report not found");
  await prisma.report.delete({ where: { id: reportId } });
  return { message: "Report deleted successfully" };
}

export async function getAnalyticsSummary() {
  const [totalUsers, totalDocs, completedDocs, summariesGenerated, translationsGenerated, usersByRole, docsByAction] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.document.count({ where: { status: "COMPLETED" } }),
    prisma.document.count({ where: { status: "COMPLETED", processingOption: { in: ["SUMMARIZE", "SUMMARIZE_TRANSLATE"] } } }),
    prisma.document.count({ where: { status: "COMPLETED", processingOption: { in: ["TRANSLATE", "SUMMARIZE_TRANSLATE"] } } }),
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.document.groupBy({ by: ["processingOption"], _count: { id: true } }),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivity = await prisma.document.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  return {
    totalUsers,
    totalDocuments: totalDocs,
    completedDocuments: completedDocs,
    summariesGenerated,
    translationsGenerated,
    successRate: totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0,
    documentsLast30Days: recentActivity,
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.id || 0 })),
    documentsByAction: docsByAction.map((d) => ({
      action: d.processingOption === "SUMMARIZE_TRANSLATE"
        ? "SUMMARIZE_TRANSLATE"
        : d.processingOption === "SUMMARIZE" ? "SUMMARIZE" : "TRANSLATE",
      count: d._count.id || 0,
    })),
  };
}

export async function getLanguageDistribution() {
  const [sourceLanguages, targetLanguages] = await Promise.all([
    prisma.document.groupBy({ by: ["sourceLanguage"], _count: { id: true } }),
    prisma.document.groupBy({ by: ["targetLanguage"], _count: { id: true } }),
  ]);

  return {
    source: sourceLanguages.map((l) => ({ language: l.sourceLanguage, count: l._count.id || 0 })),
    target: targetLanguages.map((l) => ({ language: l.targetLanguage, count: l._count.id || 0 })),
  };
}

export async function getWeeklyStats() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [users, documents] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.document.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true, processingOption: true },
    }),
  ]);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activity = order.map((day) => ({
    name: day,
    signups: 0,
    documents: 0,
    summaries: 0,
    translations: 0,
  }));

  users.forEach((u) => {
    const dayName = days[u.createdAt.getDay()];
    const entry = activity.find((a) => a.name === dayName);
    if (entry) entry.signups++;
  });

  documents.forEach((d) => {
    const dayName = days[d.createdAt.getDay()];
    const entry = activity.find((a) => a.name === dayName);
    if (entry) {
      entry.documents++;
      if (d.status === "COMPLETED") {
        if (d.processingOption === "SUMMARIZE" || d.processingOption === "SUMMARIZE_TRANSLATE") {
          entry.summaries++;
        }
        if (d.processingOption === "TRANSLATE" || d.processingOption === "SUMMARIZE_TRANSLATE") {
          entry.translations++;
        }
      }
    }
  });

  return activity;
}

