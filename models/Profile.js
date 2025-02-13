import { DataTypes as dt } from "sequelize";
import { ID, INTEGER, STR_REQ } from "../constants/db.js";
import { db } from "../db/clients.js";

const Profile = db.define("Profile", {
  id: ID,
  fullName: STR_REQ,
  about: dt.TEXT,
  gender: dt.ENUM("Male", "Female", "Other"),
  dob: dt.DATEONLY,
  forums: INTEGER,
  followers: INTEGER,
  following: INTEGER,
});

export default Profile;
