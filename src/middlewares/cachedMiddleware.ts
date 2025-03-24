import { NextFunction, Request, Response } from "express";
import redisClient from "../core/redisClient";
import { debugLog } from "../utils/debugLog";

export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method !== "GET") {
    return next();
  }

  const key = req.originalUrl;

  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      debugLog("Cache hit:", key);
      return res.json(JSON.parse(cachedData));
    }
    debugLog("Cache missed:", key);
    next();
  } catch (error) {
    debugLog("Redis Middleware Error:\n", error);
    next();
  }
};
