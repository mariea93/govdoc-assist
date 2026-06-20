import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().default("govlingua-dev-secret-key-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  PROCESSING_API_KEY: z.string().default("dev-processing-key"),
  AI_SERVICE_URL: z.string().default("http://localhost:8000"),
});

export const env = envSchema.parse(process.env);
