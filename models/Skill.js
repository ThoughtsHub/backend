import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

const Skill = db.define("Skill", {
  id: attr.id,
  name: {
    type: dt.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: dt.STRING,
    allowNull: false,
  },
});

export default Skill;
