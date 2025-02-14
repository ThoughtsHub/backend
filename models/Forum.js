import { DataTypes as dt } from "sequelize";
import { ID, INTEGER, STR_REQ, UNIQ_STR_REQ } from "../constants/db.js";
import { db } from "../db/clients.js";

const Forum = db.define("Forum", {
  id: ID,
  title: STR_REQ,
  description: dt.TEXT,
  images: dt.ARRAY(dt.STRING),
  handle: UNIQ_STR_REQ,
  upvotes: INTEGER,
  downvotes: INTEGER,
  comments: INTEGER,
});

export default Forum;
