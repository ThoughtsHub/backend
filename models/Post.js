import { DataTypes as dt } from "sequelize";
import { ID, INTEGER, STR_REQ, UNIQ_STR_REQ } from "../constants/db.js";
import { db } from "../db/clients.js";

const Post = db.define("Post", {
  id: ID,
  title: STR_REQ,
  body: dt.TEXT,
  images: dt.ARRAY(dt.STRING),
  caption: dt.STRING,
  category: dt.STRING,
  genres: dt.STRING,
  color: dt.STRING,
  alignment: dt.STRING,
  handle: UNIQ_STR_REQ,
  likes: INTEGER,
  downvotes: INTEGER,
  shares: INTEGER,
});

export default Post;
