import { NextFunction, Request, Response } from "express";
import { customResponse } from "../utils/customResponse";

const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const shortName = req.headers["x-tenant"] as string;

  if (!shortName || typeof shortName !== "string") {
    return res.status(400).json(
      customResponse({
        message: "Company shortname is required in x-tenant header",
        statusCode: 400,
      })
    );
  }
  req.company = shortName;
  next();
};

export default tenantMiddleware;
