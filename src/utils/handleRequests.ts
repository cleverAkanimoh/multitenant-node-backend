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
