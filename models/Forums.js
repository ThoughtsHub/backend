import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const Forum = db.define(
  "Forum",
  {
    id: { ...types.ID },
    localId: { ...types.STRING },
    title: { ...types.STR_REQ },
    body: { ...types.TEXT_REQ },
    imageUrl: { ...types.STRING },
    ...timestamps,
  },
  { hooks }
);

export default Forum;
