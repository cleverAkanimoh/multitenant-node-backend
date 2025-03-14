import { Request, Response, NextFunction } from "express";
import { customResponse } from "../utils/customResponse";

const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const shortName = req.headers["x-company-shortName"] as string;

  if (!shortName || typeof shortName !== "string") {
    return res.status(400).json(
      customResponse({
        message: "Company shortname is required in x-company-shortName header",
        statusCode: 400,
      })
    );
  }
  req.company = shortName;
  next();
};

export default tenantMiddleware;
