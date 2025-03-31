import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const ProfileCollege = db.define(
  "ProfileCollege",
  {
    id: { ...types.ID },
    name: { ...types.STR_REQ },
    collegeId: { ...types.STRING },
    course: { ...types.STR_REQ },
    courseId: { ...types.STRING },
    description: { ...types.TEXT },
    startYear: { ...types.INTEGER_REQ },
    endYear: { ...types.INTEGER_REQ },
    ...timestamps,
  },
  { hooks }
);

export default ProfileCollege;
