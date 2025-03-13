import { Request, Response, NextFunction } from "express";
import { customResponse } from "../utils/customResponse";

const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const designerId = req.headers["x-designer-id"] as string;

  if (!designerId || typeof designerId !== "string") {
    return res.status(400).json(
      customResponse({
        message: "Designer ID is required in x-designer-id header",
        statusCode: 400,
      })
    );
  }
  req.designer = designerId;
  next();
};

export default tenantMiddleware;
