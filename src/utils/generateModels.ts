import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import { convertCase } from "./convertCase";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: ts-node ./src/utils/generateModel.ts <path_to_excel_file> <filename>"
  );
  process.exit(1);
}

const filePath = args[0];
const fileName = args[1];

const PascalFileName = convertCase(fileName, "pascal");
const camelFileName = convertCase(fileName, "camel");

// Load Excel file
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const headers = xlsx.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];

if (!headers) {
  console.error("No headers found in the Excel file.");
  process.exit(1);
}

const attributes = headers.map((value) => convertCase(value, "camel"));
const basePath = `C:/Users/Crush_Clever/software_development/WD/BE/emetrics-backend/src/apps/(dashboard)/${camelFileName}/`;

// Generate Sequelize Model
const sequelizeModel = `import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Organization from "../../organization/models";

export interface ${PascalFileName}Attributes {
  id: number;
  ${attributes.map((attr) => `${attr}: string;`).join("\n  ")}
}

export interface ${convertCase(
  fileName,
  "pascal"
)}CreationAttributes extends Optional<${convertCase(
  fileName,
  "pascal"
)}Attributes, "id"> {}

class ${PascalFileName} extends Model<${convertCase(
  fileName,
  "pascal"
)}Attributes, ${convertCase(
  fileName,
  "pascal"
)}CreationAttributes> implements ${PascalFileName}Attributes {
  public id!: number;
  ${attributes.map((attr) => `public ${attr}!: string;`).join("\n  ")}

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

${PascalFileName}.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ${attributes
      .map(
        (attr) => `${attr}: {
      type: DataTypes.STRING,
      allowNull: false,
    },`
      )
      .join("\n       ")}
  },
  {
    sequelize,
    tableName: "${fileName.toLowerCase()}",
    modelName: "${PascalFileName}",
    timestamps: true,
  }
);

Organization.hasMany(${PascalFileName}, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "${fileName.toLowerCase()}",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

${PascalFileName}.belongsTo(Organization, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "organization",
});

export default ${PascalFileName};
`;

const controller = `
import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import ${fileName} from "../models";

export const ${PascalFileName}Schema = Joi.object({
  ${attributes.map((attr) => `${attr}: Joi.string().required(),`).join("\n  ")}
});

const ${PascalFileName}Controller = new ModelViewSet({
  model: ${PascalFileName},
  schema: ${PascalFileName}Schema,
});

export default ${PascalFileName}Controller;
`;

const routes = `
import { Router } from "express";

import { bulkUpload } from "../../../storage/uploadMiddleware";
import ${PascalFileName}Controller from "../controllers";

const router = Router();

router.get("/", ${PascalFileName}Controller.list);
router.post("/", ${PascalFileName}Controller.create);
router.get("/:id", ${PascalFileName}Controller.retrieve);
router.put("/:id", ${PascalFileName}Controller.update);
router.delete("/:id", ${PascalFileName}Controller.destroy);
router.post(
  "/bulk-upload",
  bulkUpload.single("file") as any,
  ${PascalFileName}Controller.bulkUpload
);

export default router;

`;

const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const modelPath = path.join(basePath, "models");
const controllerPath = path.join(basePath, "controllers");
const routePath = path.join(basePath, "routes");

ensureDirExists(modelPath);
ensureDirExists(controllerPath);
ensureDirExists(routePath);

fs.writeFileSync(path.join(modelPath, "index.ts"), sequelizeModel);
fs.writeFileSync(path.join(controllerPath, "index.ts"), controller);
fs.writeFileSync(path.join(routePath, "index.ts"), routes);

console.log("Sequelize model saved in: " + path.join(modelPath, "index.ts"));
console.log("Controllers saved in: " + path.join(controllerPath, "index.ts"));
console.log("Routes saved in: " + path.join(routePath, "index.ts"));
