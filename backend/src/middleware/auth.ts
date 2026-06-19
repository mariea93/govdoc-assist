import type { NextFunction, Request, Response } from "express";
import type { User, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";
import { verifyToken } from "../utils/jwt.js";

export type AuthenticatedRequest = Request & {
  user: User;
};

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const token = header.slice(7);
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.status === "DISABLED") {
      throw new UnauthorizedError("Account not found or disabled");
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(user.role)) {
      next(new ForbiddenError("Insufficient permissions"));
      return;
    }
    next();
  };
}

export function optionalProcessingKey(req: Request, _res: Response, next: NextFunction) {
  next();
}
