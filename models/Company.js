import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";
import baseModel from "./BaseModel.js";

const Company = db.define(
  "Company",
  {
    id: { ...ATTR.ID },
    name: { ...ATTR.STR_REQ },
    about: dt.TEXT,
    ...baseModel.config,
  },
  { ...baseModel.options }
);

export default Company;
