import _env from "../constants/env.js";
import retry from "../utils/reconnect.js";
import { Sequelize } from "sequelize";
import { createClient } from "redis";

const DB = _env.db.sql; // sql database
const SqlDatabase = new Sequelize(DB.DB, DB.USER, DB.PASS, {
  host: DB.HOST,
  dialect: DB.DIALECT,
});

export const client = createClient({ url: _env.db.nosql.URI });
client.on("error", (err) => {
  console.error("Redis connection error:", err);
});

const stopVal = true,
  interval = 5000;

const connectToNoSqlDb = async () => {
  await retry(
    async () => {
      try {
        await client.connect();

        console.log("Connected to Redis");
        return true;
      } catch (err) {
        console.log(err);
        console.log("Retrying...");
      }
      return false;
    },
    stopVal,
    interval
  );
};

const connectToSqlDb = async () => {
  await retry(
    async () => {
      try {
        await SqlDatabase.authenticate();

        console.log("Connected to Sql Database");
        return true;
      } catch (err) {
        console.log(err);
        console.log("Retrying...");
      }
      return false;
    },
    stopVal,
    interval
  );
};

const _connect = {
  nosql: connectToNoSqlDb,
  sql: connectToSqlDb,
};

export const db = SqlDatabase;

export default _connect;
