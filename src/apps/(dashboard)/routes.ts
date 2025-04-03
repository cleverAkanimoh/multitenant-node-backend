import { Express } from "express";
import careerPathRoutes from "../(dashboard)/careerpath/routes";
import kpisRoutes from "../(dashboard)/kpis/routes";
import objectiveRoutes from "../(dashboard)/objectives/routes";
import perspectiveRoutes from "../(dashboard)/perspectives/routes";
import { authenticate } from "../authentication/middlewares";
import companyRoutes from "./organization/routes";
import peopleRoutes from "./people/routes";

export const getDashboardEndpoints = (app: Express) => {
  app.use("/dashboard/organization", authenticate, companyRoutes);
  app.use("/dashboard/perspectives", authenticate, perspectiveRoutes);
  app.use("/dashboard/objectives", authenticate, objectiveRoutes);
  app.use("/dashboard/kpis", authenticate, kpisRoutes);
  app.use("/dashboard/people", authenticate, peopleRoutes);
  app.use("/dashboard/career-path", authenticate, careerPathRoutes);
  app.use("/dashboard/designation", authenticate, peopleRoutes);
  app.use("/dashboard/career-path", authenticate, peopleRoutes);
};
