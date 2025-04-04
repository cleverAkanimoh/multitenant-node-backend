import fs from "fs";
import Joi from "joi";
import path from "path";
import * as ts from "typescript";
import { baseUrl, docTitle } from "../core/configs";

const baseSwagger = {
  swagger: "2.0",
  info: {
    title: docTitle,
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

/**
 * Recursively scan the apps directory for route files.
 * Only process files named "routes.ts" or "index.ts" when found in a folder with "routes" in its path.
 */
function scanFiles(dir: string) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanFiles(fullPath);
    } else if (
      entry.name === "routes.ts" ||
      (entry.name === "index.ts" && dir.toLowerCase().includes("routes"))
    ) {
      console.log(`📂 Found Route File: ${fullPath}`);
      processRouteFile(fullPath);
    }
  });
}

/**
 * Extract a route prefix from the route file location.
 * For example, if the file is in "apps/appName/subfolder/routes/index.ts",
 * the prefix will be "/subfolder".
 */
function getRoutePrefix(filePath: string): string {
  const appBase = findAppBase(filePath);
  const dirOfRoute = path.dirname(filePath);
  let appDir = path.basename(appBase);
  let relativeDir = path.relative(appBase, dirOfRoute);
  console.log(`📂 Relative Dir: ${relativeDir || "/"},  appDir: ${appDir}`);

  appDir = appDir.replace(/authentication/gi, "auth");
  appDir = appDir.replace(/[()]/g, "");
  relativeDir = relativeDir.replace(/routes/gi, "");
  relativeDir = relativeDir.split(path.sep).filter(Boolean).join("/");

  // Prefix with the appDir
  return relativeDir ? `/${appDir}/${relativeDir}` : `/${appDir}`;
}

function processRouteFile(filePath: string) {
  const routeGroup = path.basename(findAppBase(filePath));
  const prefix = getRoutePrefix(filePath);
  extractRoutesFromFile(filePath, prefix);
  // Then, try to locate the controllers for this app.
  const appBase = findAppBase(filePath);
  const controllerPath = findControllerFile(appBase);
  if (controllerPath) {
    console.log(
      `🔍 Found controllers at ${controllerPath} for group ${routeGroup}`
    );
    extractJoiSchemasFromController(controllerPath, routeGroup);
  } else {
    console.warn(`⚠️ No controllers found for group ${routeGroup}`);
  }
}

/**
 * Given a route file path, determine the app base folder.
 * Assumes the app folder is a direct child of APPS_DIR.
 */
function findAppBase(filePath: string): string {
  const relative = path.relative(APPS_DIR, filePath);
  const parts = relative.split(path.sep);
  return path.join(APPS_DIR, parts[0]);
}

/**
 * Recursively search for controllers/index.ts starting from a given root.
 */
function findControllerFile(root: string): string | null {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.toLowerCase() === "controllers") {
        const candidate = path.join(fullPath, "index.ts");
        if (fs.existsSync(candidate)) return candidate;
      }
      const found = findControllerFile(fullPath);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Extract route endpoints from a routes file.
 * Looks for patterns like router.get('/path', ...), router.post("/path", ...), etc.
 */
function extractRoutesFromFile(filePath: string, parentPrefix: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const routeRegex =
    /router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/gi;
  let match: RegExpExecArray | null;
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toLowerCase();
    const routePath = match[2];
    // Combine the parent's prefix with the route path
    const fullPath = path.posix.join(parentPrefix, routePath);
    if (!baseSwagger.paths[fullPath]) {
      baseSwagger.paths[fullPath] = {};
    }
    // Add a basic endpoint description.
    baseSwagger.paths[fullPath][method] = {
      description: "",
      parameters:
        method === "get"
          ? []
          : [
              {
                name: "body",
                in: "body",
                schema: {
                  type: "object",
                  properties: {},
                },
              },
            ],
      responses: {
        "400": { description: "Bad Request" },
      },
    };
    console.log(`🟢 Extracted route: [${method.toUpperCase()}] ${fullPath}`);
  }
}

/**
 * Extract Joi schemas from a controller file.
 */
function extractJoiSchemasFromController(
  controllerPath: string,
  routeGroup: string
) {
  console.log(`🔍 Scanning Controller: ${controllerPath}`);
  const content = fs.readFileSync(controllerPath, "utf-8");
  const sourceFile = ts.createSourceFile(
    controllerPath,
    content,
    ts.ScriptTarget.ESNext,
    true
  );
  const schemas: Record<string, any> = {};

  sourceFile.forEachChild((node) => {
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((declaration) => {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.name.text.endsWith("Schema")
        ) {
          const schemaName = declaration.name.text;
          try {
            // Dynamically load the module.
            const controllerModule = require(controllerPath);
            const joiSchema = controllerModule[schemaName];
            if (Joi.isSchema(joiSchema)) {
              schemas[schemaName] = joiSchema.describe();
              console.log(`🟢 Extracted schema: ${schemaName}`);
            }
          } catch (error) {
            console.error(
              `❌ Error extracting schema "${schemaName}" from ${controllerPath}:`,
              error
            );
          }
        }
      });
    }
  });

  if (Object.keys(schemas).length > 0) {
    baseSwagger.definitions[routeGroup] = {
      ...(baseSwagger.definitions[routeGroup] || {}),
      ...schemas,
    };
  }
}

export default function autoGenerateSwaggerSpecs() {
  console.log(`🔍 Scanning apps directory: ${APPS_DIR}`);
  scanFiles(APPS_DIR);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(baseSwagger, null, 2));
  console.log(`✅ Swagger schema saved at ${OUTPUT_FILE}`);
}

autoGenerateSwaggerSpecs();
