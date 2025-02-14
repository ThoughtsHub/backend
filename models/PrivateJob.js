import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";

const PrivateJob = db.define("PrivateJob", {
  id: ATTR.ID,
  title: ATTR.STR_REQ,
  description: dt.TEXT,
  images: dt.ARRAY(dt.STRING),
  category: dt.ARRAY(dt.STRING),
  location: ATTR.STR_REQ,
  salary: dt.JSON({ min: dt.DECIMAL(10, 2), max: dt.DECIMAL(10, 2) }),
  type: dt.STRING,
  highlights: dt.ARRAY(dt.STRING),
  requirements: dt.JSON({
    experience: dt.STRING,
    education: dt.STRING,
    age: dt.JSON({ min: 18, max: 60 }),
    gender: dt.ENUM("Male", "Female", "Other", "Any"),
  }),
  handle: ATTR.UNIQ_STR_REQ,
});

export default PrivateJob;
