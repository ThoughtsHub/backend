import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const College = db.define(
  "College",
  {
    id: types.ID,
    aisheCode: types.STR_REQ,
    name: types.STR_REQ,
    state: types.STR_REQ,
    district: types.STRING,
    yearOfEstablishment: types.INTEGER,
    website: types.STRING,
    location: types.STRING,
    administrativeManagement: types.STRING,
    standaloneType: types.STRING,
    management: types.STRING,
    collegeType: types.STRING,
    universityName: types.STRING,
    universityType: types.STRING,
    other: types.JSON,
    ...timestamps,
  },
  { hooks }
);

export default College;
