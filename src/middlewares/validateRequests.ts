import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { customResponse } from "../utils/customResponse";

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json(customResponse({
        statusCode: 400,
        message: error.details[0].message,
        data: error.details.map((detail) => detail.message),
      }));
    }

    next();
  };
};
