import cors from "cors";
import dotenv from "dotenv";
import { Express } from "express";
import { debugLog } from "../utils/debugLog";

dotenv.config();

const corsSetup = (app: Express) => {
  const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(",") || [];

  app.use(
    cors({
      origin: allowedOrigins,
      optionsSuccessStatus: 200,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "x-tenant"],
      credentials: true,
    })
  );

  debugLog("CORS setup successfully");
};

export default corsSetup;
