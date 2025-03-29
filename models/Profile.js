import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const Profile = db.define(
  "Profile",
  {
    id: types.ID,
    username: types.STRING,
    fullName: types.STR_REQ,
    about: types.TEXT_REQ,
    profileImageUrl: types.STRING,
    gender: types.STRING,
    dob: types.BIGINT,
    followers: types.INT_REQ_0,
    following: types.INT_REQ_0,
    storyCount: types.INT_REQ_0,
    forumsCount: types.INT_REQ_0,
    ...timestamps,
  },
  { hooks }
);

export default Profile;
