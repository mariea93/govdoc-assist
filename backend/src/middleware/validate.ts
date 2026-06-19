import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { AppError } from "../utils/errors.js";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as Request["query"];
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as Request["params"];
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.code, message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "validation_error",
      message: "Invalid request data",
      details: err.flatten(),
    });
  }

  console.error(err);
  return res.status(500).json({ error: "internal_error", message: "Internal server error" });
}
