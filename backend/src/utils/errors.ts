export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "not_found", message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, "unauthorized", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, "forbidden", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, "conflict", message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = "bad_request") {
    super(400, code, message);
  }
}
