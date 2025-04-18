import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const Feedback = db.define(
  "Feedback",
  {
    id: { ...types.ID },
    message: { ...types.STR_REQ },
    ...timestamps,
  },
  { hooks }
);

export default Feedback;
