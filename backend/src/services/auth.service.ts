import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error-handler.js";
import { Role } from "@prisma/client";
import type { AuthPayload } from "../middleware/auth.js";

function generateToken(userId: string, role: Role): string {
  const payload: AuthPayload = { userId, role };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
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

export async function register(data: {
  name: string;
  email: string;
  password: string;
  office?: string;
}) {
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      passwordHash,
      role: "USER",
      preferences: { create: {} },
    },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  await prisma.activityLog.create({
    data: { userId: user.id, action: "REGISTER", details: "User account created" },
  });

  const token = generateToken(user.id, user.role);
  return {
    user: {
      ...user,
      office: getOfficeByRole(user.role),
    },
    token,
  };
}

export async function login(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(403, "Account is disabled. Please contact your administrator.");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, "Invalid email or password");
  }

  await prisma.activityLog.create({
    data: { userId: user.id, action: "LOGIN", details: "User logged in" },
  });

  const token = generateToken(user.id, user.role);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      office: getOfficeByRole(user.role),
      status: user.status,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function getProfile(userId: string) {
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
    },
  });
  if (!user) throw new AppError(404, "User not found");
  return {
    ...user,
    office: getOfficeByRole(user.role),
  };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new AppError(400, "Current password is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  await prisma.activityLog.create({
    data: { userId, action: "PASSWORD_CHANGE", details: "Password updated" },
  });

  return { message: "Password updated successfully" };
}

export async function updateProfile(userId: string, data: { name?: string; email?: string; office?: string }) {
  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: userId } },
    });
    if (existing) throw new AppError(409, "Email already in use");
  }

  const { office, ...updateData } = data;
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  await prisma.activityLog.create({
    data: { userId, action: "PROFILE_UPDATE", details: "Profile updated" },
  });

  return {
    ...user,
    office: getOfficeByRole(user.role),
  };
}
