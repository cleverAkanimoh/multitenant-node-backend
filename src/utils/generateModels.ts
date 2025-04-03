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

// Load Excel file
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const headers = xlsx.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];

if (!headers) {
  console.error("No headers found in the Excel file.");
  process.exit(1);
}

// const toCamelCase = (str: string): string =>
//   str
//     .replace(/\s(.)/g, (match) => match.toUpperCase())
//     .replace(/\s/g, "") // Remove spaces
//     .replace(/^(.)/, (match) => match.toLowerCase());

const attributes = headers.map((value) => convertCase(value, "camel"));

// Generate Sequelize Model
const sequelizeModel = `import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Company from "../../company/models";

export interface ${convertCase(fileName, "pascal")}Attributes {
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

class ${convertCase(fileName, "pascal")} extends Model<${convertCase(
  fileName,
  "pascal"
)}Attributes, ${convertCase(
  fileName,
  "pascal"
)}CreationAttributes> implements ${convertCase(fileName, "pascal")}Attributes {
  public id!: number;
  ${attributes.map((attr) => `public ${attr}!: string;`).join("\n  ")}

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

${convertCase(fileName, "pascal")}.init(
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
    modelName: "${convertCase(fileName, "pascal")}",
    timestamps: true,
  }
);

Company.hasMany(${convertCase(fileName, "pascal")}, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "${fileName.toLowerCase()}",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

${convertCase(fileName, "pascal")}.belongsTo(Company, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "company",
});

export default ${convertCase(fileName, "pascal")};
`;

const basePath = `C:/Users/Crush_Clever/software_development/WD/BE/emetrics-backend/src/apps/(dashboard)/${fileName.toLowerCase()}/`;

// Generate Joi Schema
const joiSchema = `import Joi from "joi";

export const ${convertCase(fileName, "pascal")}Schema = Joi.object({
  ${attributes.map((attr) => `${attr}: Joi.string().required(),`).join("\n  ")}
});
`;

const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Define paths
const modelPath = path.join(basePath, "models");
const schemaPath = path.join(basePath, "schema");

// Create directories if they don't exist
ensureDirExists(modelPath);
ensureDirExists(schemaPath);

// Save files
fs.writeFileSync(path.join(modelPath, "index.ts"), sequelizeModel);
fs.writeFileSync(path.join(schemaPath, "index.ts"), joiSchema);

console.log("Sequelize model saved in: " + path.join(modelPath, "index.ts"));
console.log("Joi schema saved in: " + path.join(schemaPath, "index.ts"));
