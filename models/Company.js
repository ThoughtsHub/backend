import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";

const Company = db.define("Company", {
  id: { ...ATTR.ID },
  name: { ...ATTR.STR_REQ },
  about: dt.TEXT,
});

export default Company;
