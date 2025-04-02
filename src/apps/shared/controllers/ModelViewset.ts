import { Request, Response } from "express";
import { Model, ModelStatic } from "sequelize";
import * as XLSX from "xlsx";
import { getTenantModel } from "../../../core/multitenancy";
import { customResponse } from "../../../utils/customResponse";
import {
  handleNotFound,
  handleRequests,
  handleValidationError,
} from "../../../utils/handleRequests";
import { withTransaction } from "../../../utils/withTransaction";

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
  private isTenantModel?: boolean;

  constructor({
    model,
    isTenantModel = true,
    name,
    schema,
  }: {
    model: ModelStatic<T>;
    schema?: any;
    name?: string;
    isTenantModel?: boolean;
  }) {
    this.model = model;
    this.schema = schema;
    this.name = name;
    this.isTenantModel = isTenantModel;
  }

  current = async (req: Request, res: Response) => {
    joiToSwagger(this.schema);

    const TenantModel = this.isTenantModel
      ? getTenantModel(this.model, req.company)
      : this.model;

    return handleRequests({
      promise: TenantModel.findByPk(req.company),
      message: null,
      res,
    });
  };

  create = async (req: Request, res: Response) => {
    joiToSwagger(this.schema);
    if (this.schema) {
      const { error } = this.schema.validate(req.body);
      if (error) return handleValidationError(res, error);
    }

    const TenantModel = this.isTenantModel
      ? getTenantModel(this.model, req.company)
      : this.model;

    return await withTransaction(async (transaction) => {
      if (req.body.name) {
        const existingRecord = await TenantModel.findOne({
          where: { name: req.body.name.toLowerCase() },
        });

        if (existingRecord) {
          return res.status(400).json({
            message: `${
              req.body.name || this.name || TenantModel.name || ""
            } with the same name already exists`,
          });
        }
      }

      return await handleRequests({
        promise: TenantModel.create(req.body, { transaction }),
        message: `${
          req.body.name || this.name || TenantModel.name || ""
        } created successfully`,
        res,
        statusCode: 201,
      });
    });
  };

  list = async (req: Request, res: Response) => {
    joiToSwagger(this.schema);
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const limitValue = Number(limit);

    const TenantModel = this.isTenantModel
      ? getTenantModel(this.model, req.company)
      : this.model;

    await handleRequests({
      promise: TenantModel.findAndCountAll({ limit: limitValue, offset }),
      message: `${this.name || TenantModel.name || ""}s retrieved successfully`,
      res,
      resData: (data: any) => {
        const totalPages = Math.ceil(data.count / limitValue);
        const currentPage = Number(page);
        return {
          count: data.count,
          page: currentPage,
          perPage: limitValue,
          totalPages,
          nextPage: currentPage < totalPages ? currentPage + 1 : null,
          previousPage: currentPage > 1 ? currentPage - 1 : null,
          data: data.rows,
        };
      },
    });
  };

  retrieve = async (req: Request, res: Response) => {
    joiToSwagger(this.schema);
    const { id } = req.params;

    await handleRequests({
      promise: this.model.findByPk(id),
      message: `${this.name || this.model.name || ""} retrieved successfully`,
      res,
      resData: (record) => {
        if (!record) {
          handleNotFound({
            res,
            message: `${this.name || this.model.name || ""} not found`,
          });
          return null;
        }
        return record;
      },
    });
  };

  update = async (req: Request, res: Response) => {
    joiToSwagger(this.schema);
    const { id } = req.params;

    if (this.schema) {
      const { error } = this.schema.validate(req.body);
      if (error) return handleValidationError(res, error);
    }

    if (!id) {
      throw new Error("No id found in request param");
    }

    const TenantModel = this.isTenantModel
      ? getTenantModel(this.model, req.company)
      : this.model;

    await withTransaction(async (transaction) => {
      await handleRequests({
        promise: TenantModel.update(req.body, {
          where: { id: id as any },
          transaction,
        }),
        message: `${this.name || this.model.name || ""} updated successfully`,
        res,
        callback: async () => {
          const updatedRecord = await TenantModel.findByPk(id, { transaction });
          if (!updatedRecord) {
            handleNotFound({
              res,
              message: `${this.name || this.model.name || ""} not found`,
            });
          } else {
            return res.status(200).json(
              customResponse({
                data: updatedRecord,
                statusCode: 200,
                message: `${
                  this.name || this.model.name || ""
                } updated successfully`,
              })
            );
          }
        },
      });
    });
  };

  bulkUpload = async (req: Request, res: Response) => {
    joiToSwagger(this.schema);
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

      await withTransaction(async (transaction) => {
        await handleRequests({
          promise: this.model.bulkCreate(data as any, { transaction }),
          message: `${this.model.name || ""} records uploaded successfully`,
          res,
          statusCode: 201,
        });
      });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Invalid file format or processing error", error });
    }
  };

  destroy = async (req: Request, res: Response) => {
    const { id } = req.params;

    await withTransaction(async (transaction) => {
      await handleRequests({
        promise: this.model.destroy({ where: { id: id as any }, transaction }),
        message: `${this.name || this.model.name || ""} deleted successfully`,
        res,
        callback: undefined,
        resData: (deleted) => {
          if (!deleted) {
            handleNotFound({
              res,
              message: `${this.name || this.model.name || ""} not found`,
            });
            return null;
          }
          return {
            message: `${
              this.name || this.model.name || ""
            } deleted successfully`,
          };
        },
      });
    });
  };

  // bulkDestroy = async (req: Request, res: Response) => {
  //   const { ids } = req.body;

  //   if (!Array.isArray(ids) || ids.length === 0) {
  //     return res.status(400).json({ message: "Invalid or empty array of IDs" });
  //   }

  //   await withTransaction(async (transaction) => {
  //     // Soft delete records using the `paranoid` option
  //     await handleRequests({
  //       promise: this.model.bulkDelete(
  //         { id: { [Op.in]: ids } },
  //         { transaction }
  //       ),
  //       message: `${this.model.name || ""} records deleted successfully`,
  //       res,
  //       statusCode: 200,
  //       resData: (affectedRows: number) => {
  //         if (affectedRows === 0) {
  //           return res.status(404).json({
  //             message: `${this.model.name || ""} records not found`,
  //           });
  //         }
  //         return {
  //           message: `${affectedRows} records soft deleted successfully`,
  //         };
  //       },
  //     });
  //   });
  // };
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

    if (joiDesc.type === "alternatives") {
      return {
        oneOf: joiDesc.matches.map((match: any) => convert(match.schema)),
      };
    }

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
