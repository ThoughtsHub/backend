import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const StoryLike = db.define(
  "StoryLike",
  {
    id: { ...types.ID },
    ...timestamps,
  },
  { hooks }
);

export default StoryLike;
