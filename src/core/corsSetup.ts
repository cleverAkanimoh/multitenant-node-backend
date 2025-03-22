import cors from "cors";
import { Express } from "express";

const corsSetup = (app: Express) => {
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
      ],
      optionsSuccessStatus: 200,
      //   exposedHeaders: "",
      //   preflightContinue:true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "x-tenant"],
      credentials: true,
    })
  );
  console.log("CORS setup successfully");
};

export default corsSetup;
