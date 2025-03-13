import { NextFunction, Response, Request } from "express";
import { customResponse } from "../utils/customResponse";
import { Prisma } from "@prisma/client";

export const globalErrorResolver = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Unexpected Error:", err);
  console.error(err.stack);
  // Handle Prisma Errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(500).json(
      customResponse({
        message:
          "Database connection failed. Please check your database settings.",
        statusCode: 500,
      })
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json(
      customResponse({
        message: `Database error: ${err.message}`,
        statusCode: 400,
      })
    );
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    return res.status(500).json(
      customResponse({
        message: "Unknown database error occurred.",
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

