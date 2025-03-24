import { Express } from "express";
import { baseUrl } from "./core/configs";


import authRoutes from "./apps/authentication/routes";
import storageRoutes from "./apps/storage/routes";

import { setupSwagger } from "./core/swagger.config";

import path from "path";
import { debugLog } from "./utils/debugLog";

export const configAppRoutes = (app: Express, express: any) => {
  // static
  app.use("/statics", express.static(path.join(__dirname, "public")));
  // Documentation

  setupSwagger(app);

  app.use("/auth", authRoutes);
  app.use("/storage", storageRoutes);

  debugLog("All endpoints started at " + baseUrl);
};
