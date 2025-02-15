import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";

const Comment = db.define("Comment", {
  id: { ...ATTR.ID },
  comment: { ...ATTR.TEXT_REQ },
  likes: { ...ATTR.INTEGER },
});

export default Comment;
