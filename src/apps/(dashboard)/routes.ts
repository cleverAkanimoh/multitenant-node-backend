import { Express } from "express";
import companyRoutes from "../(dashboard)/company/routes";
import employeesRoutes from "../(dashboard)/employees/routes";
import objectiveRoutes from "../(dashboard)/objectives/routes";
import kpisRoutes from "../(dashboard)/kpis/routes";
import perspectiveRoutes from "../(dashboard)/perspectives/routes";
import { authenticate } from "../authentication/middlewares";

export const getDashboardEndpoints = (app: Express) => {
  app.use("/dashboard/organization", authenticate, companyRoutes);
  app.use("/dashboard/perspectives", authenticate, perspectiveRoutes);
  app.use("/dashboard/objectives", authenticate, objectiveRoutes);
  app.use("/dashboard/kpis", authenticate, kpisRoutes);
  app.use("/dashboard/people", authenticate, employeesRoutes);
  app.use("/dashboard/designation", authenticate, employeesRoutes);
  app.use("/dashboard/career-path", authenticate, employeesRoutes);
};
