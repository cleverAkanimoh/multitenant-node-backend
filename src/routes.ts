import { Express } from "express";
import { baseUrl } from "./core/configs";

import { getDashboardEndpoints } from "./apps/(dashboard)/routes";
import authRoutes from "./apps/authentication/routes";
import storageRoutes from "./apps/storage/routes";
import { setupSwagger } from "./core/swagger.config";

import path from "path";
import { debugLog } from "./utils/debugLog";

export const configAppRoutes = (app: Express, express: any) => {
  // static
  app.use("/statics", express.static(path.join(__dirname, "public")));

  setupSwagger(app);

  app.use("/auth", authRoutes);
  getDashboardEndpoints(app);
  app.use("/storage", storageRoutes);

  debugLog("All endpoints started at " + baseUrl);
};
