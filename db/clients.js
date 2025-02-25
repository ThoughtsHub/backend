import { createClient } from "redis";
import { NODE_ENV, POSTGRESQL, REDIS } from "../constants/env.js";
import { Sequelize } from "sequelize";

const DB = POSTGRESQL; // pgsql database
const SqlDatabase = new Sequelize(DB.DB, DB.USER, DB.PASS, {
  host: DB.HOST,
  dialect: DB.DIALECT,
  logging: NODE_ENV !== "prod",
});

const redisClient = createClient({ url: REDIS.URI }); // redis client

export const db = SqlDatabase;
export const client = redisClient;
