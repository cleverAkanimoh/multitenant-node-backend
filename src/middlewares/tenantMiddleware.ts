import { NextFunction, Request, Response } from "express";
import User from "../apps/users/models/user";
import { getTenantModel } from "../core/orm";
import { customResponse } from "../utils/customResponse";

declare global {
  namespace Express {
    interface Request {
      tenantUserModel?: any;
    }
  }
}

const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers["x-tenant-id"] as string;

  if (!tenantId || typeof tenantId !== "string") {
    return res.status(400).json(
      customResponse({
        message: "Missing tenant ID",
        statusCode: 400,
      })
    );
  }

  try {
    req.tenantUserModel = getTenantModel(User, tenantId);
    next();
  } catch (error) {
    res.status(500).json({ message: "Failed to set tenant schema", error });
  }
};

export default tenantMiddleware;
