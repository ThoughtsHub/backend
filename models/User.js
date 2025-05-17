import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const User = db.define(
  "User",
  {
    id: { ...types.ID },
    password: { ...types.STR_REQ },
    email: { ...types.STRING, unique: true },
    mobile: { ...types.STRING, unique: true },
    ...timestamps,
  },
  { hooks }
);

export default User;
