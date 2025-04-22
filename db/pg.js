import { literal, Sequelize } from "sequelize";
import { nodeEnv, pg } from "../env/env.config.js";

const db = new Sequelize(pg.database, pg.username, pg.password, {
  host: pg.server,
  dialect: "postgres",
  define: { timestamps: false },
  logging: nodeEnv.production === true ? false : console.log,
});

export const connectToPg = async () => {
  await db.authenticate();

  console.log("Connected to Postgresql database");
};

export const closePg = async () => {
  await db.close();

  console.log("Closed Postgresql connection");
};

export const randomOrder = literal("RANDOM()");

export default db;
