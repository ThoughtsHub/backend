import { client, db } from "./connect.js";

const closeNoSqlConnection = async () => {
  try {
    await client.quit();

    console.log("Closed Redis Connection");
  } catch (err) {
    console.log(err);
    console.log("Failed to close Redis Connection");
  }
};

const closeSqlConnection = async () => {
  try {
    await db.close();

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
