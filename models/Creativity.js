import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

const Creativity = db.define("Creativity", {
  id: attr.id,
  title: {
    type: dt.STRING,
  },
  body: {
    type: dt.TEXT,
  },
  likes: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  comments: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  shares: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  reports: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

export default Creativity;
