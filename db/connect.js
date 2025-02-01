import mongoose from "mongoose";
import _env from "../constants/env.js";
import retry from "../utils/reconnect.js";
import { Sequelize } from "sequelize";

const DB = _env.db.sql; // sql database
const SqlDatabase = new Sequelize(DB.DB, DB.USER, DB.PASS, {
  host: DB.HOST,
  dialect: DB.DIALECT,
});

const stopVal = true,
  interval = 5000;

const connectToNoSqlDb = () => {
  retry(
    async () => {
      try {
        await mongoose.connect(_env.db.nosql.URI);

        console.log("Connected to Mongo Db");
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

const connectToSqlDb = () => {
  retry(
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
