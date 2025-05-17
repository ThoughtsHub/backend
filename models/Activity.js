import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const Activity = db.define(
  "Activity",
  {
    id: { ...types.ID },
    type: { ...types.STR_REQ },
    title: { ...types.STR_REQ },
    description: { ...types.TEXT },
    ...timestamps,
  },
  { hooks }
);

export default Activity;
