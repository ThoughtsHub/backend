import { DataTypes as dt } from "sequelize";
import { ID, INTEGER, STR_REQ } from "../constants/db.js";
import { db } from "../db/clients.js";

const School = db.define("School", {
  id: ID,
  schoolName: STR_REQ,
  studyCourse: STR_REQ,
  description: dt.TEXT,
  startDate: dt.DATEONLY,
  startYear: INTEGER,
  endDate: dt.DATEONLY,
  endYear: INTEGER,
});

export default School;
