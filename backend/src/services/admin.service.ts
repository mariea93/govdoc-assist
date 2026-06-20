import bcrypt from "bcryptjs";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error-handler.js";
import { Role, UserStatus } from "@prisma/client";

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
        office: true,
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
      office: u.office,
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
      office: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { documents: true, validations: true } },
    },
  });
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
  office?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      office: data.office || "Public",
      preferences: { create: {} },
      organizationProfile: { create: {} },
    },
    select: { id: true, name: true, email: true, role: true, office: true, status: true, createdAt: true },
  });

  return user;
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

  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true, office: true, status: true, createdAt: true },
  });
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, role: true, office: true, status: true },
  });
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
  return settings;
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
  return prisma.systemSettings.update({ where: { id: settings.id }, data });
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

  return { logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
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
  return prisma.report.create({
    data: {
      reportName: data.reportName,
      period: data.period,
      type: data.type || "general",
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
  if (data.content) updateData.content = data.content;

  return prisma.report.update({ where: { id: reportId }, data: updateData });
}

export async function deleteReport(reportId: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError(404, "Report not found");
  await prisma.report.delete({ where: { id: reportId } });
  return { message: "Report deleted successfully" };
}

export async function getAnalyticsSummary() {
  const [totalUsers, totalDocs, completedDocs, usersByRole, docsByAction] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.document.count({ where: { status: "COMPLETED" } }),
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.document.groupBy({ by: ["action"], _count: { id: true } }),
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
    successRate: totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0,
    documentsLast30Days: recentActivity,
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.id })),
    documentsByAction: docsByAction.map((d) => ({ action: d.action, count: d._count.id })),
  };
}

export async function getLanguageDistribution() {
  const [sourceLanguages, targetLanguages] = await Promise.all([
    prisma.document.groupBy({ by: ["sourceLanguage"], _count: { id: true } }),
    prisma.document.groupBy({ by: ["targetLanguage"], _count: { id: true } }),
  ]);

  return {
    source: sourceLanguages.map((l) => ({ language: l.sourceLanguage, count: l._count.id })),
    target: targetLanguages.map((l) => ({ language: l.targetLanguage, count: l._count.id })),
  };
}
