import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "@prisma/client";

export type JwtPayload = {
  userId: number;
  email: string;
  role: UserRole;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
