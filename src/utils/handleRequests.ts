import { Response } from "express";
import { customResponse } from "./customResponse";

export async function handleRequests<T>(
  promise: Promise<T>,
  message: string | null,
  res: Response,
  callback?: () => any
) {
  try {
    if (callback) {
      callback?.();
      return;
    }
    const data = await promise;
    res.status(200).json(
      customResponse({
        message,
        statusCode: 200,
        data,
      })
    );
  } catch (error) {
    res.status(500).json(
      customResponse({
        message: error instanceof Error ? error.message : "An error occurred",
        statusCode: 500,
      })
    );
  }
}

export const handleValidationError = (res: Response, error: any) => {
  return res.status(400).json(
    customResponse({
      message: error.details[0].message,
      statusCode: 400,
      data: error.details,
    })
  );
};

export const handleNotFound = (res: Response, message: string) => {
  return res.status(404).json(customResponse({ message, statusCode: 404 }));
};

export const handleUnauthorized = (res: Response, message: string) => {
  return res.status(401).json(customResponse({ message, statusCode: 401 }));
};
