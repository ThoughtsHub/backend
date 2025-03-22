import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const User = db.define(
  "User",
  {
    id: types.ID,
    username: types.UNIQUE_STR_REQ,
    password: types.STR_REQ,
    email: types.STRING,
    mobile: types.STRING,
    ...timestamps,
  },
  { hooks }
);

export default User;
