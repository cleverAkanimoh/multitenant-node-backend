import { PrismaClient } from "@prisma/client";
import redisClient from "./redisClient";

export const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  const result = await next(params);

  if (["create", "update", "delete"].includes(params.action)) {
    await redisClient.flushDb();
    console.log("Cache cleared for ", params.model);
  }

  return result;
});
