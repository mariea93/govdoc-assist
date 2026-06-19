import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/errors.js";
import {
  toApiPlatformLanguage,
  toApiRole,
  toApiStatus,
} from "../utils/mappers.js";
import { hashPassword, validatePasswordStrength, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import * as activityLogService from "./activityLog.service.js";

function serializeUser(user: User) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: toApiRole(user.role),
    office: user.office,
    status: toApiStatus(user.status),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function register(name: string, email: string, password: string) {
  validatePasswordStrength(password);

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "USER",
      office: "Public",
      status: "ACTIVE",
      preferences: { create: {} },
      organization: { create: {} },
    },
  });

  await activityLogService.create({
    userId: user.id,
    userName: user.name,
    action: `Registered new account: ${user.email}`,
    status: "COMPLETED",
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { token, user: serializeUser(user) };
}

export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new BadRequestError("Please fill in all fields", "missing_fields");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.status === "DISABLED") {
    throw new UnauthorizedError("This account has been disabled");
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { token, user: serializeUser(user) };
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { preferences: true, organization: true },
  });

  if (!user) {
    throw new UnauthorizedError();
  }

  return {
    ...serializeUser(user),
    preferences: user.preferences
      ? {
          interfaceLanguage: toApiPlatformLanguage(user.preferences.interfaceLanguage),
          defaultSummaryLength: user.preferences.defaultSummaryLength.toLowerCase(),
          defaultTargetLanguage: user.preferences.defaultTargetLanguage,
          emailNotifications: user.preferences.emailNotifications,
        }
      : null,
    organization: user.organization,
  };
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  validatePasswordStrength(newPassword);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedError();
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new BadRequestError("Current password is incorrect", "invalid_credentials");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return { success: true };
}
