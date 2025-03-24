import { NextFunction, Request, Response } from "express";
import redisClient from "../core/redisClient";

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
      console.log("Cache hit:", key);
      return res.json(JSON.parse(cachedData));
    }
    console.log("Cache missed:", key);
    next();
  } catch (error) {
    console.error("Redis Middleware Error:\n", error);
    next();
  }
};
