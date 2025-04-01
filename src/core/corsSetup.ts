import cors from "cors";
import dotenv from "dotenv";
import { Express } from "express";
import { debugLog } from "../utils/debugLog";

dotenv.config();

const corsSetup = (app: Express) => {
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://167.99.237.171:8080",
      ],
      optionsSuccessStatus: 200,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "x-tenant"],
      credentials: true,
    })
  );

  debugLog("CORS setup successfully");
};

export default corsSetup;
