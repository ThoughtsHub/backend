import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";
import { _months } from "../constants/other.js";

const Education = db.define("Education", {
  id: attr.id,
  school: {
    type: dt.STRING,
    allowNull: false,
  }, // university or school name
  degree: {
    type: dt.STRING,
    allowNull: false,
  }, // 12th, Btech, etc.
  fieldOfStudy: dt.STRING, // civil engg, pcm, etc.
  startMonth: {
    type: dt.STRING,
    allowNull: false,
    values: _months,
  }, // start date necessary
  startYear: {
    type: dt.INTEGER,
    allowNull: false,
    validate: {
      min: 1950, // at least this old can still add
      // max will be done manually by checking if it is not
      // more than current year
    },
  }, // start date necessary
  endMonth: {
    type: dt.STRING,
    values: _months,
  }, // not so imp
  endYear: dt.INTEGER, // not so imp
  grade: {
    type: dt.STRING, // typechecking will happen manually,
  }, // 0-10, 0-100
  gradeType: {
    type: dt.STRING,
    defaultValue: "%", // default to % (82 %, 32%)
  }, // CPI, Percentage, %, Grade
  activitesAndSocieties: {
    type: dt.TEXT,
    set(value) {
      if (value !== null)
        value = Buffer.from(value, "utf-8").toString("base64");
      this.setDataValue("activitesAndSocieties", value);
    },
    get() {
      let value = this.getDataValue("activitesAndSocieties");
      if (value !== null)
        value = Buffer.from(value, "base64").toString("utf-8");
      return value;
    },
  },
  description: {
    type: dt.TEXT,
    set(value) {
      if (value !== null)
        value = Buffer.from(value, "utf-8").toString("base64");
      this.setDataValue("description", value);
    },
    get() {
      let value = this.getDataValue("description");
      if (value !== null)
        value = Buffer.from(value, "base64").toString("utf-8");
      return value;
    },
  },
  // skill will be linked by table
  images: dt.ARRAY(dt.STRING), // urls of image
  grade_: {
    type: dt.VIRTUAL,
    get() {
      if (this.grade != null) return this.grade + " " + this.gradeType;
      return null;
    },
  }, // 82 %, 5.7 CPI, 23 Percentage, A Grade, 1.2 Grade
});

export default Education;
