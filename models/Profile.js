import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import User from "./User.js";

const Profile = db.define(
  "Profile",
  {
    id: { ...types.ID },
    userId: {
      ...types.UNIQUE_FOREIGN_ID_REQ,
      references: { model: User, key: "id" },
    },
    username: { ...types.UNIQUE_STR_REQ },
    fullName: { ...types.STR_REQ },
    about: { ...types.TEXT },
    profileImageUrl: { ...types.STRING },
    gender: { ...types.STRING },
    dob: { ...types.BIGINT },
    followers: { ...types.INT_REQ_0 },
    following: { ...types.INT_REQ_0 },
    forums: { ...types.INT_REQ_0 },
    referralCode: { ...types.STR_REQ },
    ...timestamps,
  },
  { hooks }
);

export default Profile;
