import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";
import baseModel from "./BaseModel.js";

const School = db.define(
  "School",
  {
    id: { ...ATTR.ID },
    collegeId: { ...ATTR.STR_REQ },
    degreeId: { ...ATTR.STR_REQ },
    fieldId: { ...ATTR.STR_REQ },
    description: dt.TEXT,
    startDate: dt.DATEONLY,
    startYear: { ...ATTR.INTEGER },
    endDate: dt.DATEONLY,
    endYear: { ...ATTR.INTEGER },
    ...baseModel.config,
  },
  { ...baseModel.options }
);

export default School;
