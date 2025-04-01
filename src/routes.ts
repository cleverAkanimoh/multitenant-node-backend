import { Express } from "express";
import { baseUrl } from "./core/configs";

import authRoutes from "./apps/authentication/routes";
import storageRoutes from "./apps/storage/routes";
import { setupSwagger } from "./core/swagger.config";

import path from "path";
import { getDashboardEndpoints } from "./apps/(dashboard)/routes";
import { authenticate } from "./apps/authentication/middlewares";
import { debugLog } from "./utils/debugLog";

export const configAppRoutes = (app: Express, express: any) => {
  app.use("/statics", express.static(path.join(__dirname, "public")));

  setupSwagger(app);

  app.use("/auth", authRoutes);
  app.use("/storage", authenticate, storageRoutes);
  getDashboardEndpoints(app);
  // getStorageEndpoints(app);

  debugLog("All endpoints started at " + baseUrl);
};
