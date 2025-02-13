import { DataTypes as dt } from "sequelize";
import { ID, INTEGER, TEXT_REQ } from "../constants/db.js";
import { db } from "../db/clients.js";

const Comment = db.define("Comment", {
  id: ID,
  comment: TEXT_REQ,
  likes: INTEGER,
});

export default Comment;
