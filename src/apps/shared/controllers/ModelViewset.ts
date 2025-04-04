import { Request, Response } from "express";
import { Model, ModelStatic } from "sequelize";
import * as XLSX from "xlsx";
import { getTenantModel } from "../../../core/multitenancy";
import { convertCase } from "../../../utils/convertCase";
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

  private getTenantModel(req: Request) {
    return this.isTenantModel
      ? getTenantModel(this.model, req.organization)
      : this.model;
  }

  private validateSchema(req: Request, res: Response) {
    joiToSwagger(this.schema);
    if (this.schema) {
      const { error } = this.schema.validate(req.body);
      if (error) {
        handleValidationError(res, error);
        return false;
      }
    }
    return true;
  }

  private handleRecordNotFound(res: Response, record: any, message: string) {
    if (!record) {
      handleNotFound({ res, message });
      return true;
    }
    return false;
  }

  current = async (req: Request, res: Response) => {
    const TenantModel = this.getTenantModel(req);
    return handleRequests({
      promise: TenantModel.findByPk(req.organization),
      message: null,
      res,
    });
  };

  create = async (req: Request, res: Response) => {
    if (!this.validateSchema(req, res)) return;

    const TenantModel = this.getTenantModel(req);

    return await withTransaction(async (transaction) => {
      if (req.body.name) {
        const existingRecord = await TenantModel.findOne({
          where: { name: req.body.name.toLowerCase() },
        });

        if (existingRecord) {
          return res.status(400).json(
            customResponse({
              statusCode: 400,
              message: `${convertCase(req.body.name, "sentence")} ${
                this.name?.toLowerCase() ||
                TenantModel.name?.toLowerCase() ||
                ""
              } already exists`,
              data: existingRecord,
            })
          );
        }
      }

      return await handleRequests({
        promise: TenantModel.create(req.body, { transaction }),
        message: `${convertCase(req.body.name || "", "sentence")} ${
          this.name?.toLowerCase() || TenantModel.name?.toLowerCase() || ""
        } created successfully`,
        res,
        statusCode: 201,
      });
    });
  };

  list = async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const limitValue = Number(limit);

    const TenantModel = this.getTenantModel(req);

    await handleRequests({
      promise: TenantModel.findAndCountAll({
        limit: limitValue,
        offset,
        order: [["createdAt", "ASC"]],
      }),
      message: null,
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
    const { id } = req.params;

    await handleRequests({
      promise: this.model.findByPk(id),
      message: `${convertCase(req.body.name || "", "sentence")} ${
        this.name?.toLowerCase() || this.model.name?.toLowerCase() || ""
      } retrieved successfully`,
      res,
      resData: (record) => {
        if (
          this.handleRecordNotFound(
            res,
            record,
            `${this.name || this.model.name || ""} not found`
          )
        ) {
          return null;
        }
        return record;
      },
    });
  };

  update = async (req: Request, res: Response) => {
    if (!this.validateSchema(req, res)) return;

    const { id } = req.params;
    if (!id) throw new Error("No id found in request param");

    const TenantModel = this.getTenantModel(req);

    await withTransaction(async (transaction) => {
      await handleRequests({
        promise: TenantModel.update(req.body, {
          where: { id: id as any },
          transaction,
        }),
        message: `${convertCase(req.body.name || "", "sentence")} ${
          this.name?.toLowerCase() || this.model.name?.toLowerCase() || ""
        } updated successfully`,
        res,
        callback: async () => {
          const updatedRecord = await TenantModel.findByPk(id, { transaction });
          if (
            this.handleRecordNotFound(
              res,
              updatedRecord,
              `${convertCase(req.body.name || "", "sentence")} ${
                this.name?.toLowerCase() || this.model.name?.toLowerCase() || ""
              } not found`
            )
          ) {
            return;
          }
          return res.status(200).json(
            customResponse({
              data: updatedRecord,
              statusCode: 200,
              message: `${convertCase(req.body.name || "", "sentence")} ${
                this.name?.toLowerCase() || this.model.name?.toLowerCase() || ""
              } updated successfully`,
            })
          );
        },
      });
    });
  };

  bulkUpload = async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];

      if (this.schema) {
        for (const record of data) {
          record.tenantId = req.organization;
          record.createdBy = (req.user as { email: string })?.email;
          if (record.name) {
            record.name = record.name.toLowerCase();
          }
          for (const key in record) {
            const camelCaseKey = convertCase(key, "camel");
            if (camelCaseKey !== key) {
              record[camelCaseKey] = record[key];
              delete record[key];
            }
          }

          const { error } = this.schema.validate(record);
          if (error) {
            return handleValidationError(res, error);
          }
        }
      }
      const TenantModel = this.getTenantModel(req);

      for (const record of data) {
        if (record.name) {
          const existingRecord = await TenantModel.findOne({
            where: { name: record.name.toLowerCase() },
          });

          if (existingRecord) {
            return res.status(400).json(
              customResponse({
                statusCode: 400,
                message: `${convertCase(record.name, "sentence")} ${
                  this.name?.toLowerCase() ||
                  TenantModel.name?.toLowerCase() ||
                  ""
                } already exists`,
                data: existingRecord,
              })
            );
          }
        }
      }

      await withTransaction(async (transaction) => {
        await handleRequests({
          promise: TenantModel.bulkCreate(data, { transaction }),
          message: `${convertCase(
            this.model.name || "",
            "sentence"
          )} records uploaded successfully`,
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

    const TenantModel = this.getTenantModel(req);

    await withTransaction(async (transaction) => {
      await handleRequests({
        promise: TenantModel.destroy({ where: { id: id as any }, transaction }),
        message: `${
          this.name?.toLowerCase() || TenantModel.name?.toLowerCase() || ""
        } deleted successfully`,
        res,
        resData: (deleted) => {
          if (!deleted) {
            handleNotFound({
              res,
              message: `${
                this.name?.toLowerCase() ||
                TenantModel.name?.toLowerCase() ||
                ""
              } not found`,
            });
            return null;
          }
          return {
            message: `${
              this.name?.toLowerCase() || TenantModel.name?.toLowerCase() || ""
            } deleted successfully`,
          };
        },
      });
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
