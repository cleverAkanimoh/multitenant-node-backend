import cors from "cors";
import dotenv from "dotenv";
import { Express } from "express";
import { debugLog } from "../utils/debugLog";

dotenv.config();
const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(",") || [];

console.log({allowedOrigins});


export const corsConfig = {
  origin: [
    ...allowedOrigins,
    "https://node.emetricsapi.watchdoglogisticsng.com",
    "https://emetrics-app-v2.netlify.app",
  ],
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-tenant"],
  credentials: true,
};

const corsSetup = (app: Express) => {
  app.use(cors(corsConfig));
  app.options("*", cors(corsConfig));

  debugLog("CORS setup successfully");
};

export default corsSetup;
