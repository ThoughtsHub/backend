import { Sequelize } from "sequelize";
import { pg } from "../env/env.config.js";

const db = new Sequelize(pg.database, pg.username, pg.password, {
  host: pg.server,
  dialect: "postgres",
  define: { timestamps: false },
});

export const connectToPg = async () => {
  await db.authenticate();

  console.log("Connected to Postgresql database");
};

export const closePg = async () => {
  await db.close();

  console.log("Closed Postgresql connection");
};

export default db;
