import { Request, Response } from "express";
import { Model, ModelStatic } from "sequelize";
import * as XLSX from "xlsx";
import { getTenantModel } from "../../../core/multitenancy";
import {
  handleNotFound,
  handleRequests,
  handleValidationError,
} from "../../../utils/handleRequests";

/**
 * @swagger
 * tags:
 *   name: ModelViewSet
 *   description: Generic CRUD operations for models
 */
class ModelViewSet<T extends Model> {
  private model: ModelStatic<T>;
  private schema?: any;
  private name?: string;
  private isGlobal?: boolean;

  constructor(
    model: ModelStatic<T>,
    schema?: any,
    name?: string,
    isGlobal?: boolean
  ) {
    this.model = model;
    this.schema = schema;
    this.name = name;
    this.isGlobal = isGlobal;
  }

  /**
   * @swagger
   * /current:
   *   get:
   *     summary: Get the current record
   *     tags: [ModelViewSet]
   *     responses:
   *       200:
   *         description: Successfully retrieved the current record
   *       404:
   *         description: Record not found
   */
  current = async (req: Request, res: Response) => {
    console.log({ tenantId: req.company });

    const TenantModel = getTenantModel(this.model, req.company);

    return handleRequests({
      promise: TenantModel.findByPk(req.company),
      message: null,
      res,
    });
  };

  getRequestBodySchema() {
    if (this.schema) {
      return {
        required: true,
        content: {
          "application/json": {
            schema: joiToSwagger(this.schema),
          },
        },
      };
    }
    return undefined;
  }

  /**
   * @swagger
   * /create:
   *   post:
   *     summary: Create a new record
   *     tags: [ModelViewSet]
   *     requestBody:
   *       $ref: '#/components/requestBodies/CreateRequestBody'
   *     responses:
   *       201:
   *         description: Successfully created a new record
   *       400:
   *         description: Validation error
   */
  create = async (req: Request, res: Response) => {
    if (this.schema) {
      const { error } = this.schema.validate(req.body);
      if (error) return handleValidationError(res, error);
    }

    return await handleRequests({
      promise: this.model.create(req.body),
      message: `${this.model.name || ""} created successfully`,
      res,
      statusCode: 201,
    });
  };

  /**
   * @swagger
   * /list:
   *   get:
   *     summary: Get all records with pagination
   *     tags: [ModelViewSet]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of records per page
   *     responses:
   *       200:
   *         description: Successfully retrieved records
   */
  list = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const limitValue = Number(limit);

    await handleRequests({
      promise: this.model.findAndCountAll({ limit: limitValue, offset }),
      message: `${this.model.name}s retrieved successfully`,
      res,
      resData: (data) => ({
        total: data.count,
        page: Number(page),
        perPage: limitValue,
        totalPages: Math.ceil(data.count / limitValue),
        data: data.rows,
      }),
    });
  };

  /**
   * @swagger
   * /retrieve/{id}:
   *   get:
   *     summary: Get a single record by ID
   *     tags: [ModelViewSet]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Record ID
   *     responses:
   *       200:
   *         description: Successfully retrieved the record
   *       404:
   *         description: Record not found
   */
  retrieve = async (req: Request, res: Response) => {
    const { id } = req.params;

    await handleRequests({
      promise: this.model.findByPk(id),
      message: `${this.model.name} retrieved successfully`,
      res,
      resData: (record) => {
        if (!record) {
          handleNotFound({ res, message: `${this.model.name} not found` });
          return null;
        }
        return record;
      },
    });
  };

  /**
   * @swagger
   * /update/{id}:
   *   put:
   *     summary: Update a record by ID
   *     tags: [ModelViewSet]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Record ID
   *     requestBody:
   *       $ref: '#/components/requestBodies/UpdateRequestBody'
   *     responses:
   *       200:
   *         description: Successfully updated the record
   *       400:
   *         description: Validation error
   */
  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (this.schema) {
      const { error } = this.schema.validate(req.body);
      if (error) return handleValidationError(res, error);
    }

    await handleRequests({
      promise: this.model.update(req.body, { where: { id: id as any } }),
      message: `${this.model.name} updated successfully`,
      res,
      callback: async () => {
        const updatedRecord = await this.model.findByPk(id);
        if (!updatedRecord) {
          handleNotFound({ res, message: `${this.model.name} not found` });
        } else {
          res.status(200).json(updatedRecord);
        }
      },
    });
  };

  /**
   * @swagger
   * /bulk-upload:
   *   post:
   *     summary: Bulk upload records from an Excel file
   *     tags: [ModelViewSet]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: Excel file to upload
   *     responses:
   *       201:
   *         description: Successfully uploaded records
   *       400:
   *         description: Validation error or invalid file format
   */
  bulkUpload = async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      if (this.schema) {
        for (const record of data) {
          const { error } = this.schema.validate(record);
          if (error) {
            return handleValidationError(res, error);
          }
        }
      }

      await handleRequests({
        promise: this.model.bulkCreate(data as any),
        message: `${this.model.name || ""} records uploaded successfully`,
        res,
        statusCode: 201,
      });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Invalid file format or processing error", error });
    }
  };

  /**
   * @swagger
   * /delete/{id}:
   *   delete:
   *     summary: Delete a record by ID
   *     tags: [ModelViewSet]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Record ID
   *     responses:
   *       200:
   *         description: Successfully deleted the record
   *       404:
   *         description: Record not found
   */
  destroy = async (req: Request, res: Response) => {
    const { id } = req.params;

    await handleRequests({
      promise: this.model.destroy({ where: { id: id as any } }),
      message: `${this.model.name} deleted successfully`,
      res,
      resData: (deleted) => {
        if (!deleted) {
          handleNotFound({ res, message: `${this.model.name} not found` });
          return null;
        }
        return { message: `${this.model.name} deleted successfully` };
      },
    });
  };
}

function joiToSwagger(schema: any) {
  const swaggerSchema = schema.describe();
  const convert = (joiDesc: any): any => {
    const typeMap: Record<string, string> = {
      string: "string",
      number: "number",
      boolean: "boolean",
      array: "array",
      object: "object",
      date: "string",
    };

    const swaggerType = typeMap[joiDesc.type];
    if (!swaggerType) {
      throw new Error(`Unsupported Joi type: ${joiDesc.type}`);
    }

    const result: any = { type: swaggerType };

    if (joiDesc.flags?.presence === "required") {
      result.required = true;
    }

    if (joiDesc.rules) {
      for (const rule of joiDesc.rules) {
        if (rule.name === "min") {
          result.minLength = rule.args.limit;
        } else if (rule.name === "max") {
          result.maxLength = rule.args.limit;
        } else if (rule.name === "pattern") {
          result.pattern = rule.args.regex.toString();
        }
      }
    }

    if (swaggerType === "array" && joiDesc.items) {
      result.items = convert(joiDesc.items[0]);
    }

    if (swaggerType === "object" && joiDesc.keys) {
      result.properties = {};
      result.required = [];
      for (const [key, value] of Object.entries(joiDesc.keys)) {
        result.properties[key] = convert(value);
        if ((value as any).flags?.presence === "required") {
          result.required.push(key);
        }
      }
      if (result.required.length === 0) {
        delete result.required;
      }
    }

    return result;
  };

  return convert(swaggerSchema);
}

export default ModelViewSet;
