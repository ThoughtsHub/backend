import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const ForumComment = db.define(
  "ForumComment",
  {
    id: types.ID,
    localID: types.STRING,
    body: types.TEXT_REQ,
    ...timestamps,
  },
  { hooks }
);

export default ForumComment;
