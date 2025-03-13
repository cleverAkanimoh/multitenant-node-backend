import cors from "cors";
import { Express } from "express";

const corsSetup = (app: Express) => {
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:7000"],
      optionsSuccessStatus: 200,
      //   exposedHeaders: "",
      //   preflightContinue:true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "x-company-shortName"],
      credentials: true,
    })
  );
  console.log("CORS setup successfully");
};

export default corsSetup;
