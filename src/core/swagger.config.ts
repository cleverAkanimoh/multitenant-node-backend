import { Express } from "express";
import swaggerUi from "swagger-ui-express";

import { debugLog } from "../utils/debugLog";
import { baseUrl } from "./configs";

import swaggerSpecs from "../swagger-schema.json";

export const setupSwagger = async (app: Express) => {
  // autoGenerateSwaggerSpecs();

  app.use(
    "/docs",
    swaggerUi.serve as any,
    swaggerUi.setup(swaggerSpecs) as any
  );

  debugLog("📃 Swagger docs available at " + baseUrl + "/docs");
};

export default setupSwagger;
