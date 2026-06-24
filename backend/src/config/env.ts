import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const readNumber = (name: string, fallback: number): number => {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a number.`);
  }

  return parsed;
};

const readString = (name: string, fallback: string): string => {
  return process.env[name] || fallback;
};

const readRequiredString = (name: string): string => {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Environment variable ${name} is required.`);
  }

  return value;
};

export const env = {
  nodeEnv: readString("NODE_ENV", "development"),
  port: readNumber("BACKEND_PORT", 5000),
  apiPrefix: readString("BACKEND_API_PREFIX", "/api"),
  database: {
    host: readString("DATABASE_HOST", "localhost"),
    port: readNumber("DATABASE_PORT", 3306),
    name: readString("DATABASE_NAME", "traceai"),
    user: readString("DATABASE_USER", "traceai_user"),
    password: readString("DATABASE_PASSWORD", "")
  },
  jwtSecret: readRequiredString("JWT_SECRET"),
  jwtAccessTokenExpiresIn: readString("JWT_ACCESS_TOKEN_EXPIRES_IN", "1h"),
  aiServiceUrl: readString("AI_SERVICE_URL", "http://localhost:8000"),
  uploadStoragePath: readString("UPLOAD_STORAGE_PATH", "./storage/uploads"),
  uploadMaxFileSizeBytes: readNumber("UPLOAD_MAX_FILE_SIZE_BYTES", 10 * 1024 * 1024)
};
