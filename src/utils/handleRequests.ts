import { Response } from "express";
import { customResponse } from "./customResponse";

interface HandleRequestsParams<T> {
  promise: Promise<T>;
  message: string | null;
  res: Response;
  callback?: () => any;
  resData?: (d: T) => any;
}

export async function handleRequests<T>({
  promise,
  message,
  res,
  callback,
  resData,
}: HandleRequestsParams<T>) {
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
        data: resData?.(data) || data,
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

interface HandleErrorParams {
  res: Response;
  message: string;
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

export const handleNotFound = ({ res, message }: HandleErrorParams) => {
  return res.status(404).json(customResponse({ message, statusCode: 404 }));
};

export const handleUnauthorized = ({ res, message }: HandleErrorParams) => {
  return res.status(401).json(customResponse({ message, statusCode: 401 }));
};
