import swaggerAutogen from "swagger-autogen";
import { Express } from "express";

import { baseUrl, docTitle } from "./configs";

const outputFile = "./swagger.json";
const endpointsFiles = [
  "./src/apps/**/routes.ts",
  "./src/routes.ts",
  "./src/index.ts",
  "./src/**/*.ts",
];

const doc = {
  info: {
    title: docTitle,
    version: "1.0.0",
    description: "API documentation for Nui Fashion SaaS",
  },
  host: baseUrl.replace(/^https?:\/\//, ""),
  basePath: "/",
  schemes: [baseUrl.startsWith("https") ? "https" : "http"],
  servers: [
    {
      url: baseUrl,
      description: "Server Base Url",
    },
  ],
};

export const redocConfig = { title: docTitle, specUrl: "/redoc" };

const generateSwaggerDocs = (app: Express) =>
  (swaggerAutogen(outputFile, endpointsFiles, doc) as any)
    .then((schema: any) => {
      // app.use("", swaggerUi.serve as any, swaggerUi.setup(schema) as any);
      // app.get("/redoc", redoc(redocConfig));
      // console.log("Swagger Schema: ", schema.data.paths);
    })
    .catch((err: any) => {
      console.error("Error generating Swagger docs:", err);
    });

export default generateSwaggerDocs;
