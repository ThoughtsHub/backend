import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Institute from "./Institute.js";
import Profile from "./Profile.js";

const ProfileEducation = db.define(
  "ProfileEducation",
  {
    id: { ...types.ID },
    instituteId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Institute, key: "id" },
    },
    profileId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Profile, key: "id" },
    },
    startYear: { ...types.INTEGER },
    startMonth: { ...types.INTEGER },
    endYear: { ...types.INTEGER },
    endMonth: { ...types.INTEGER },
    isCompleted: { ...types.BOOL_FALSE },
    ...timestamps,
  },
  { hooks }
);

export default ProfileEducation;
