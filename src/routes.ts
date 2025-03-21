import { Express } from "express";
import { baseUrl } from "./core/configs";

import redoc from "redoc-express";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./apps/authentication/routes";
import storageRoutes from "./apps/storage/routes";

import generateSwaggerDocs, { redocConfig } from "./core/swagger.config";

import path from "path";
import schema from "./swagger.json";

export const configAppRoutes = (app: Express, express: any) => {
  // static
  app.use("/statics", express.static(path.join(__dirname, "public")));
  // Documentation
  generateSwaggerDocs(app);
  app.use("/docs", swaggerUi.serve as any, swaggerUi.setup(schema) as any);
  app.get("/redoc", redoc(redocConfig));

  app.use("/auth", authRoutes);
  app.use("/storage", storageRoutes);

  console.log("All endpoints started at " + baseUrl);
};
