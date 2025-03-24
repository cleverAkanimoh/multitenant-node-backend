import { Express } from "express";
import swaggerUi from "swagger-ui-express";

import redoc from "redoc-express";
import swaggerJSDoc from "swagger-jsdoc";

import { baseUrl, docTitle } from "./configs";
import { debugLog } from "../utils/debugLog";

const endpointsFiles = [
  "./src/apps/**/routes.ts",
  "./src/routes.ts",
  "./src/index.ts",
  "./src/**/*.ts",
];

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-metrics Suite API",
      version: "1.0.0",
      description: "API documentation for E-metrics Suite",
    },
    servers: [{ url: baseUrl }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/**/*.ts ", ...endpointsFiles],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const redocConfig = { title: docTitle, specUrl: "/redoc" };

export const setupSwagger = (app: Express) => {
  app.use("/docs", swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);
  app.get("/redoc", redoc(redocConfig));
  debugLog("📃 Swagger docs available at http://localhost:8000/docs");
};

export default setupSwagger;
