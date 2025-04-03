import { Express } from "express";
import redoc from "redoc-express";
import swaggerUi from "swagger-ui-express";

import { debugLog } from "../utils/debugLog";
import { baseUrl, docTitle } from "./configs";

import swaggerSpecs from "../swagger-output.json";
import { generateSwaggerSchema } from "../utils/generateSwaggerSpecs";

const endpointsFiles = [
  "./src/apps/**/routes.ts",
  "./src/routes.ts",
  "./src/index.ts",
  "./src/**/*.ts",
];

const outputFile = "./src/swagger-output.json";

const swaggerOptions = {
  info: {
    title: docTitle,
    version: "1.0.0",
    description: "API documentation for E-metrics Suite",
  },
  host: baseUrl?.replace(/^https?:\/\//, ""),
  schemes: baseUrl?.startsWith("https") ? ["https"] : ["http"],
  securityDefinitions: {
    BearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description:
        "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
    },
  },
  security: [{ BearerAuth: [] }],
};

export const redocConfig = { title: docTitle, specUrl: "/redoc" };

export const setupSwagger = async (app: Express) => {
  generateSwaggerSchema();

  app.use(
    "/docs",
    swaggerUi.serve as any,
    swaggerUi.setup(swaggerSpecs) as any
  );

  app.get("/redoc", redoc(redocConfig));

  debugLog("📃 Swagger docs available at " + baseUrl + "/docs");
};

export default setupSwagger;
