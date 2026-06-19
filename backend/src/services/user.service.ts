import type { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import { parseRole, parseStatus, toApiRole, toApiStatus } from "../utils/mappers.js";
import { hashPassword } from "../utils/password.js";

function serializeUser(user: {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  office: string;
  status: import("@prisma/client").AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toApiRole(user.role),
    office: user.office,
    status: toApiStatus(user.status),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateProfile(userId: number, data: { name?: string; office?: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return serializeUser(user);
}

export async function listUsers(query: {
  search?: string;
  role?: string;
  page: number;
  limit: number;
}) {
  const where: {
    OR?: Array<{ name?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" } }>;
    role?: UserRole;
  } = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.role && query.role !== "all") {
    where.role = parseRole(query.role);
  }

  const [users, total, active, invited, disabled] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { ...where, status: "ACTIVE" } }),
    prisma.user.count({ where: { ...where, status: "INVITED" } }),
    prisma.user.count({ where: { ...where, status: "DISABLED" } }),
  ]);

  return {
    stats: { total, active, invited, disabled },
    users: users.map(serializeUser),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError("User not found");
  return serializeUser(user);
}

export async function createUser(data: {
  name: string;
  email: string;
  password?: string;
  role: string;
  office: string;
  status: string;
}) {
  const normalizedEmail = data.email.trim().toLowerCase();
  const passwordHash = await hashPassword(data.password ?? "Password123");

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: parseRole(data.role),
      office: data.office,
      status: parseStatus(data.status),
      preferences: { create: {} },
      organization: { create: {} },
    },
  });

  return serializeUser(user);
}

export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    role?: string;
    office?: string;
    status?: string;
  },
) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email?.trim().toLowerCase(),
      role: data.role ? parseRole(data.role) : undefined,
      office: data.office,
      status: data.status ? parseStatus(data.status) : undefined,
    },
  });
  return serializeUser(user);
}

export async function updateUserStatus(id: number, status: string) {
  const user = await prisma.user.update({
    where: { id },
    data: { status: parseStatus(status) },
  });
  return serializeUser(user);
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } });
  return { success: true };
}
