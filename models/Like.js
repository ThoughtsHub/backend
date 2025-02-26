import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";
import baseModel from "./BaseModel.js";

const Like = db.define(
  "Like",
  {
    id: { ...ATTR.ID },
    ...baseModel.config,
  },
  { ...baseModel.options }
);

export default Like;
