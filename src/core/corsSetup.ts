import cors from "cors";
import dotenv from "dotenv";
import { Express } from "express";
import { debugLog } from "../utils/debugLog";

dotenv.config();

const corsSetup = (app: Express) => {
  const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(",") || [];

  app.use(
    cors({
      origin: [...allowedOrigins, "https://emetrics-app-v2.netlify.app"],
      optionsSuccessStatus: 200,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-tenant"],
      credentials: true,
    })
  );
  app.options("*", cors());

  debugLog("CORS setup successfully");
};

export default corsSetup;
