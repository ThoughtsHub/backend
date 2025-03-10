import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";
import baseModel from "./BaseModel.js";

const Profile = db.define(
  "Profile",
  {
    id: { ...ATTR.ID },
    fullName: { ...ATTR.STR_REQ },
    about: dt.TEXT,
    gender: dt.ENUM("Male", "Female", "Other"),
    dob: dt.BIGINT,
    profileImageUrl: dt.STRING,
    forums: { ...ATTR.INTEGER },
    posts: { ...ATTR.INTEGER },
    followers: { ...ATTR.INTEGER },
    following: { ...ATTR.INTEGER },
    handle: { ...ATTR.UNIQ_STR_REQ },
    ...baseModel.config,
  },
  { ...baseModel.options }
);

export default Profile;
