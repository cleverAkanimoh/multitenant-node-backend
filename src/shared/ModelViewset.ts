import { Request, Response } from "express";
import { Model, ModelStatic } from "sequelize";
import {
  handleNotFound,
  handleRequests,
  handleValidationError,
} from "../utils/handleRequests";

class ModelViewSet<T extends Model> {
  private model: ModelStatic<T>;
  private schema?: any;

  constructor(model: ModelStatic<T>, schema?: any) {
    this.model = model;
    this.schema = schema;
  }

  // get current record

  current = async (req: Request, res: Response) => {

     console.log(req.company);

     return handleRequests({
       promise: this.model.findByPk(req.company),
       message: null,
       res,
     });
  };

  // 🔹 Create a new record
  create = async (req: Request, res: Response) => {
    if (this.schema) {
      const { error } = this.schema.validate(req.body);
      if (error) return handleValidationError(res, error);
    }

    return await handleRequests({
      promise: this.model.create(req.body),
      message: `${this.model.name} created successfully`,
      res,
      statusCode: 201,
    });
  };

  // 🔹 Get all records with pagination
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

  // 🔹 Get a single record by ID
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

  // 🔹 Update a record by ID
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

  // 🔹 Delete a record by ID
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

export default ModelViewSet;
