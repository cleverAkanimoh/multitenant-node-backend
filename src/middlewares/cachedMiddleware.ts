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

    const originalSend = res.json.bind(res);
    res.json = (body: any) => {
      redisClient.set(key, JSON.stringify(body), { EX: 3600 });
      return originalSend(body);
    };

    next();
  } catch (error) {
    debugLog("Redis Middleware Error:\n", error);
    next();
  }
};
