import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const Report = db.define(
  "Report",
  {
    id: { ...types.ID },
    reason: { ...types.STR_REQ },
    userId: { ...types.ID },
    forumId: { ...types.ID },
    ...timestamps,
  },
  { hooks }
);

export default Report;
