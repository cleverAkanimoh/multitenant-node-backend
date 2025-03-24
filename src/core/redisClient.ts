import dotenv from "dotenv";
import { createClient } from "redis";
import { debugLog } from "../utils/debugLog";

dotenv.config();

const redisClient = createClient({ url: process.env.REDIS_URL });

(async () => {
  await redisClient.connect();
  debugLog("Connected to Redis");
})();

redisClient.on("error", (err) => {
  debugLog("Redis Client Error\n", err);
  redisClient.disconnect();
});

export default redisClient;
