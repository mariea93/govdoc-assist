import type { ActivityStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function create(data: {
  userId?: number;
  userName: string;
  action: string;
  status?: ActivityStatus;
  metadata?: Record<string, unknown>;
}) {
  return prisma.activityLog.create({
    data: {
      userId: data.userId,
      userName: data.userName,
      action: data.action,
      status: data.status ?? "COMPLETED",
      metadata: data.metadata,
    },
  });
}

export async function list(limit = 50) {
  return prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
}

export async function getById(id: string) {
  return prisma.activityLog.findUnique({ where: { id } });
}

export async function deleteLog(id: string) {
  await prisma.activityLog.delete({ where: { id } });
  return { success: true };
}
