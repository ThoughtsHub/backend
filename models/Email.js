import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

export const types = {
  PRIMARY: "primary",
};

const Email = db.define("Email", {
  id: attr.id,
  email: {
    type: dt.STRING,
    allowNull: false,
    unique: true,
  },
  verified: {
    type: dt.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  type: {
    type: dt.STRING,
    values: Object.values(types),
    defaultValue: types.PRIMARY,
  },
});

export default Email;
