import { Express } from "express";
import companyRoutes from "../(dashboard)/company/routes";
import { authenticate } from "../authentication/middlewares";

export const getDashboardEndpoints = (app: Express) => {
  app.use("/dashboard/organization", authenticate, companyRoutes);
};
