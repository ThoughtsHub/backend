import { DataTypes as dt } from "sequelize";
import { ID, INTEGER, STR_REQ, UNIQ_STR_REQ } from "../constants/db.js";
import { db } from "../db/clients.js";

const Company = db.define("Company", {
  id: ID,
  name: STR_REQ,
  about: dt.TEXT,
});

export default Company;
