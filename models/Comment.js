import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";
import baseModel from "./BaseModel.js";

const Comment = db.define(
  "Comment",
  {
    id: { ...ATTR.ID },
    comment: { ...ATTR.TEXT_REQ },
    likes: { ...ATTR.INTEGER },
    ...baseModel.config,
  },
  { ...baseModel.options }
);

export default Comment;
