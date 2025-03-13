import { Request, Response, NextFunction } from "express";
import { customResponse } from "../utils/customResponse";

const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const designerId = req.headers["x-company-shortName"] as string;

  if (!designerId || typeof designerId !== "string") {
    return res.status(400).json(
      customResponse({
        message: "Company shortname is required in x-company-shortName header",
        statusCode: 400,
      })
    );
  }
  req.designer = designerId;
  next();
};

export default tenantMiddleware;
