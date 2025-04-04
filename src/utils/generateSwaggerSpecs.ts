import fs from "fs";
import Joi from "joi";
import path from "path";
import * as ts from "typescript";
import { baseUrl } from "../core/configs";

const baseSwagger = {
  swagger: "2.0",
  info: {
    title: "API documentation for E-metrics Suite",
    version: "1.0.0",
    description: "API documentation for E-metrics Suite",
  },
  host: baseUrl,
  basePath: "/",
  schemes: ["http"],
  securityDefinitions: {
    BearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description:
        "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
    },
  },
  paths: {} as Record<string, any>,
  definitions: {} as Record<string, any>,
};

const APPS_DIR = path.join(__dirname, "..", "apps");
const OUTPUT_FILE = path.join(__dirname, "..", "swagger-schema.json");

function scanFiles(dir: string) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanFiles(fullPath);
    } else if (
      entry.name === "routes.ts" ||
      (entry.name === "index.ts" && dir.toLowerCase().includes("routes"))
    ) {
      processRouteFile(fullPath);
    }
  });
}

function getAppDirAndRelativeDir(filePath: string, appBase: string) {
  const dirOfRoute = path.dirname(filePath);
  const appDir = path
    .basename(appBase)
    .replace(/authentication/gi, "auth")
    .replace(/[()]/g, "");
  const relativeDir = path
    .relative(appBase, dirOfRoute)
    .replace(/routes/gi, "")
    .split(path.sep)
    .filter(Boolean)
    .join("/");
  return { appDir, relativeDir };
}

function getRoutePrefix(filePath: string): string {
  const appBase = findAppBase(filePath);
  const { relativeDir, appDir } = getAppDirAndRelativeDir(filePath, appBase);
  return relativeDir ? `/${appDir}/${relativeDir}` : appDir;
}

function findAppBase(filePath: string): string {
  const relative = path.relative(APPS_DIR, filePath);
  const parts = relative.split(path.sep);
  return path.join(APPS_DIR, parts[0]);
}

function findControllerFile(root: string): string | null {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  let controllerFilePaths: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.toLowerCase() === "controllers") {
        const controllerPath = path.join(fullPath, "index.ts");
        if (fs.existsSync(controllerPath)) {
          controllerFilePaths.push(controllerPath);
        }
      } else {
        const found = findControllerFile(fullPath);
        if (found) {
          controllerFilePaths.push(found);
        }
      }
    }
  }

  if (controllerFilePaths.length === 0) {
    return null;
  }

  return controllerFilePaths[0];
}

function mapJoiTypeToSwagger(joiType: string): string {
  switch (joiType.toLowerCase()) {
    case "string":
    case "date":
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return "array";
    case "object":
      return "object";
    default:
      return "string";
  }
}

function joiToSwaggerSchema(joiDesc: any): any {
  const schema: any = {
    type: "object",
    properties: {},
    required: [],
  };

  if (joiDesc.type === "object" && joiDesc.keys) {
    for (const [key, prop] of Object.entries<any>(joiDesc.keys)) {
      const type = mapJoiTypeToSwagger(prop.type);
      schema.properties[key] = { type };

      if (prop.flags?.description) {
        schema.properties[key].description = prop.flags.description;
      }

      if (prop.flags?.presence === "required") {
        schema.required.push(key);
      }
    }
  }

  if (schema.required.length === 0) {
    delete schema.required;
  }

  return schema;
}

function extractRoutesFromFile(
  filePath: string,
  parentPrefix: string,
  groupRoute: string
) {
  const content = fs.readFileSync(filePath, "utf-8");
  const routeRegex =
    /router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/gi;

  let match: RegExpExecArray | null;
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toLowerCase();
    const routePath = match[2];
    const fullPath = path.posix.join(parentPrefix, routePath);

    if (!baseSwagger.paths[fullPath]) {
      baseSwagger.paths[fullPath] = {};
    }

    const definitionRef = `#/definitions/${groupRoute}`;

    baseSwagger.paths[fullPath][method] = {
      summary: "", //`Perform ${method.toUpperCase()} on ${groupRoute}`,
      description: `This endpoint allows you to ${method} data for ${groupRoute}. You can use it to create, read, update, or delete ${groupRoute} records.`,
      parameters:
        method === "get"
          ? []
          : [
              {
                name: "body",
                in: "body",
                required: true,
                schema: {
                  $ref: definitionRef,
                },
              },
            ],
      responses: {
        "200": { description: "Success" },
        "400": { description: "Bad Request" },
        "401": { description: "Unauthorized" },
        "500": { description: "Server Error" },
      },
    };
  }
}

function extractJoiSchemasFromController(controllerPath: string) {


  const content = fs.readFileSync(controllerPath, "utf-8");
  const sourceFile = ts.createSourceFile(
    controllerPath,
    content,
    ts.ScriptTarget.ESNext,
    true
  );

  const controllerModule = require(controllerPath);
  const definitions = baseSwagger.definitions;

  sourceFile.forEachChild((node) => {
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((declaration) => {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.name.text.endsWith("Schema")
        ) {
          const schemaName = declaration.name.text
            .replace(/Schema$/, "")
            .toLowerCase();

          const joiSchema = controllerModule[declaration.name.text];

          if (Joi.isSchema(joiSchema)) {
            const joiDesc = joiSchema.describe();

            if (definitions[schemaName]) {
              console.log(
                `Schema already exists for: ${schemaName}. Merging...`
              );
              const existingSchema = definitions[schemaName];
              const newSchema = joiToSwaggerSchema(joiDesc);
              definitions[schemaName] = {
                ...existingSchema,
                ...newSchema,
              };
            } else {
              definitions[schemaName] = joiToSwaggerSchema(joiDesc);
            }
          }
        }
      });
    }
  });
}

function processRouteFile(filePath: string) {
  const prefix = getRoutePrefix(filePath);
  const appBase = findAppBase(filePath);
  const { relativeDir, appDir } = getAppDirAndRelativeDir(filePath, appBase);
  const groupRoute = relativeDir || appDir;
  let definitions = baseSwagger.definitions;

  extractRoutesFromFile(filePath, prefix, groupRoute);

  const controllerPath = findControllerFile(appBase);

  if (controllerPath) {
    const schema = extractJoiSchemasFromController(controllerPath);
    console.log(controllerPath, schema);
  }
}

export default function autoGenerateSwaggerSpecs() {
  scanFiles(APPS_DIR);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(baseSwagger, null, 2));
}

autoGenerateSwaggerSpecs();
