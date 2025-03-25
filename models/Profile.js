import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const Profile = db.define(
  "Profile",
  {
    id: types.ID,
    fullName: types.STR_REQ,
    about: types.TEXT_REQ,
    profileImageUrl: types.STRING,
    gender: types.ENUM("male", "female", "other"),
    dob: types.BIGINT,
    ...timestamps,
  },
  { hooks }
);

export default Profile;
