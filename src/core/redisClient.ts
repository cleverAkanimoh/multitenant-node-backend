import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({ url: process.env.REDIS_URL });

(async () => {
  await redisClient.connect();
  console.log("Connected to Redis");
})();

redisClient.on("error", (err) => console.error("Redis Client Error\n", err));



export default redisClient;
