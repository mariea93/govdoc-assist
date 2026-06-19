import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

export function requireProcessingApiKey(req: Request, _res: Response, next: NextFunction) {
  if (!env.processingApiKey) {
    next();
    return;
  }

  const key = req.headers["x-processing-api-key"];
  if (key !== env.processingApiKey) {
    next(new UnauthorizedError("Invalid processing API key"));
    return;
  }

  next();
}
