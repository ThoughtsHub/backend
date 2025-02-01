import mongoose from "mongoose";
import { db } from "./connect.js";

const closeNoSqlConnection = () => {
  try {
    mongoose.connection.close();

    console.log("Closed Mongo Db");
  } catch (err) {
    console.log(err);
    console.log("Failed to close Mongo Db");
  }
};

const closeSqlConnection = () => {
  try {
    db.close();

    console.log("Closed Sql Db");
  } catch (err) {
    console.log(err);
    console.log("Failed to close Sql Db");
  }
};

const _close = {
  nosql: closeNoSqlConnection,
  sql: closeSqlConnection,
};

export default _close;
