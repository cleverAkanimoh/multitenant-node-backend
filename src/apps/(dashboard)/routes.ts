import { Express } from "express";
import careerPathRoutes from "./careerpath/routes";
import designationRoutes from "./designations/routes";
import kpisRoutes from "./kpis/routes";
import objectiveRoutes from "./objectives/routes";
import perspectiveRoutes from "./perspectives/routes";
import { authenticate } from "../authentication/middlewares";
import organizationRoutes from "./organization/routes";
import peopleRoutes from "./people/routes";
import structuralLevelRoutes from "./structuralLevel/routes";

export const getDashboardEndpoints = (app: Express) => {
  app.use("/dashboard/organization", authenticate, organizationRoutes);
  app.use("/dashboard/perspectives", authenticate, perspectiveRoutes);
  app.use("/dashboard/objectives", authenticate, objectiveRoutes);
  app.use("/dashboard/kpis", authenticate, kpisRoutes);
  app.use("/dashboard/people", authenticate, peopleRoutes);
  app.use("/dashboard/career-path", authenticate, careerPathRoutes);
  app.use("/dashboard/designations", authenticate, designationRoutes);
  app.use("/dashboard/payroll", authenticate, peopleRoutes);
  app.use("/dashboard/tasks", authenticate, peopleRoutes);
  app.use("/dashboard/structural-level", authenticate, peopleRoutes);
};
