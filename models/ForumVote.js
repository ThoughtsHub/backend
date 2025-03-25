import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const ForumVote = db.define(
  "ForumVote",
  {
    id: types.ID,
    value: { ...types.INTEGER_REQ, defaultValue: 1 },
    ...timestamps,
  },
  { hooks }
);

export default ForumVote;
