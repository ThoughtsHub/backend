import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const StoryComment = db.define(
  "StoryComment",
  {
    id: { ...types.ID },
    localId: { ...types.STRING },
    body: { ...types.TEXT_REQ },
    ...timestamps,
  },
  { hooks }
);

export default StoryComment;
