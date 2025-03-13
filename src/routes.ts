import { Express } from "express";
import { baseUrl } from "./core/configs";

import swaggerUi from "swagger-ui-express";
import redoc from "redoc-express";

import userRoutes from "./apps/users/routes";
import authRoutes from "./apps/authentication/routes";
import storageRoutes from "./apps/storage/routes";

import generateSwaggerDocs, { redocConfig } from "./core/swagger.config";

import schema from "./swagger.json";

export const configAppRoutes = (app: Express) => {
  // Documentation
  generateSwaggerDocs(app);
  app.use("/docs", swaggerUi.serve as any, swaggerUi.setup(schema) as any);
  app.get("/redoc", redoc(redocConfig));

  app.use("/auth", authRoutes);
  app.use("/users", userRoutes);
  app.use("/storage", storageRoutes);

  console.log("All endpoints started at " + baseUrl);
};
