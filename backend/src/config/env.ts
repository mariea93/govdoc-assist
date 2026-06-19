import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET", "dev-jwt-secret-change-in-production"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB ?? 20),
  processingApiKey: process.env.PROCESSING_API_KEY ?? "",
};
