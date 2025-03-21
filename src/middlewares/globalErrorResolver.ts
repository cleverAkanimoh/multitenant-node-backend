import { NextFunction, Request, Response } from "express";
import {
  BaseError,
  ConnectionError,
  DatabaseError,
  ValidationError,
} from "sequelize";
import { customResponse } from "../utils/customResponse";

export const globalErrorResolver = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Unexpected Error:", err);
  console.error(err.stack);

  // Handle Database Connection Errors
  if (err instanceof ConnectionError) {
    return res.status(500).json(
      customResponse({
        message: "Database connection failed. Please check your settings.",
        statusCode: 500,
      })
    );
  }

  // Handle General Database Errors
  if (err instanceof DatabaseError) {
    return res.status(400).json(
      customResponse({
        message: `Database error: ${err.message}`,
        statusCode: 400,
      })
    );
  }

  // Handle Validation Errors (e.g., Unique Constraint, Not Null Violation)
  if (err instanceof ValidationError) {
    return res.status(400).json(
      customResponse({
        message:
          "Validation error: " + err.errors.map((e) => e.message).join(", "),
        statusCode: 400,
      })
    );
  }

  // Handle Other Sequelize Errors
  if (err instanceof BaseError) {
    return res.status(500).json(
      customResponse({
        message: `Sequelize error: ${err.message}`,
        statusCode: 500,
      })
    );
  }

  // General Error Handling
  return res.status(500).json(
    customResponse({
      message: "An unexpected error occurred.",
      statusCode: 500,
    })
  );
};
