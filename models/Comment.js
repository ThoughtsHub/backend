import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

const Comment = db.define("Comment", {
  id: attr.id,
  body: {
    type: dt.TEXT,
    allowNull: false,
  },
  handle: {
    type: dt.STRING,
    allowNull: false,
    unique: true,
  },
});

export default Comment;
