import { createClient } from "redis";
import { redis } from "../env/env.config.js";

const client = createClient({ url: redis.uri });

export const connectToRedis = async () => {
  await client.connect();

  console.log("Connected to Redis");
};

export const closeRedis = async () => {
  await client.disconnect();

  console.log("Closed Redis Connection");
};

export const flushCache = async () => {
  await client.flushDb();

  console.log("Redis flushed");
};

export default client;
