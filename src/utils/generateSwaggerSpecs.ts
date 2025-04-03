import fs from "fs";
import Joi from "joi";
import path from "path";
import * as ts from "typescript";
import { debugLog } from "./debugLog";

const BASE_DIR = path.join(__dirname, "..", "apps");
const SWAGGER_SCHEMA_FILE = path.join(__dirname, "..", "swagger-schema.json");

const swaggerSchemas: Record<string, any> = {};

/**
 * Recursively scan all folders inside "src/apps" to find routes.ts and controllers.
 */
export const scanFiles = (dir: string) => {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      scanFiles(fullPath);
    } else if (file.name === "routes.ts" || file.name === "index.ts") {
      console.log(`📂 Found Route File: ${fullPath}`);
      processRouteFile(fullPath);
    }
  });
};

/**
 * Process a routes.ts or routes/index.ts file to find associated controllers and schemas.
 */
const processRouteFile = (filePath: string) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const importRegex = /import\s+\{?([^}]+)\}?\s+from\s+["'](.+)["']/g;
  const routeGroup = path.basename(path.dirname(filePath));

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[2];

    // Skip non-relative imports
    if (!importPath.startsWith(".")) continue;

    const absImportPath = path.resolve(
      path.dirname(filePath),
      importPath + ".ts"
    );

    if (fs.existsSync(absImportPath)) {
      debugLog(`📂 Found Controller File: ${absImportPath}`);
      extractJoiSchemas(absImportPath, routeGroup);
    }
  }
};

/**
 * Extract Joi Schemas from controller files
 */
const extractJoiSchemas = (controllerPath: string, routeGroup: string) => {
  console.log(`📄 Checking controller: ${controllerPath}`);

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
          const schemaCode = content.substring(node.pos, node.end);
          debugLog(`📄 Extracted schema code: ${schemaCode}`);

          try {
            // Dynamically load the file and extract the schema
            const controllerModule = require(controllerPath);
            const joiObject = controllerModule[schemaName];

            if (Joi.isSchema(joiObject)) {
              schemas[schemaName] = joiObject.describe();
            }
          } catch (error) {
            console.error(
              `❌ Failed to parse schema in ${controllerPath}:`,
              error
            );
          }
        }
      });
    }
  });

  if (Object.keys(schemas).length > 0) {
    swaggerSchemas[routeGroup] = {
      ...(swaggerSchemas[routeGroup] || {}),
      ...schemas,
    };
  }
};

/**
 * Write collected schema data into swagger-schema.json
 */
export const generateSwaggerSchema = () => {
  scanFiles(BASE_DIR);
  fs.writeFileSync(
    SWAGGER_SCHEMA_FILE,
    JSON.stringify(swaggerSchemas, null, 2)
  );
  console.log(`✅ Swagger Schema saved at ${SWAGGER_SCHEMA_FILE}`);
};
scanFiles(BASE_DIR);
// generateSwaggerSchema();
