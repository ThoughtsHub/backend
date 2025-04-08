import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const User = db.define(
  "User",
  {
    id: { ...types.ID },
    username: { ...types.STRING, unique: true },
    password: { ...types.STR_REQ },
    email: { ...types.STRING, unique: true },
    mobile: { ...types.STRING, unique: true },
    ...timestamps,
  },
  { hooks }
);

export default User;
