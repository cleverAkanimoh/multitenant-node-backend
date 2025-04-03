import { Express } from "express";
import companyRoutes from "../(dashboard)/company/routes";
import perspectiveRoutes from "../(dashboard)/perspectives/routes";
import { authenticate } from "../authentication/middlewares";

export const getDashboardEndpoints = (app: Express) => {
  app.use("/dashboard/organization", authenticate, companyRoutes);
  app.use("/dashboard/perspectives", authenticate, perspectiveRoutes);
};
