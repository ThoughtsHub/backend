import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";
import { gzipSync, gunzipSync } from "zlib";

export const shift = {
  DAY: "day shift",
  NIGHT: "night shift",
};

export const pricePer = ["hour", "day", "week", "month", "year"];

export const experience = ["Fresher", "Intermediate", "Graduate"];

export const genders = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
  ANY: "any",
};

const PrivateJob = db.define("PrivateJob", {
  id: attr.id,
  title: {
    type: dt.STRING,
    allowNull: false,
  },
  isRemote: {
    type: dt.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  shift: {
    type: dt.STRING,
    allowNull: false,
    defaultValue: shift.DAY,
  },
  price: {
    type: dt.ARRAY(dt.JSON),
    allowNull: false,
    validate: {
      isValid(value) {
        for (const price of value) {
          if ([undefined, null].includes(price.currency))
            throw new Error("Currency is required!");
          if ([undefined, null].includes(price.min))
            throw new Error("Minimum is required!");
          if (
            [undefined, null].includes(price.per) ||
            !pricePer.includes(price.per)
          )
            throw new Error("Per (Month/Year) is required!");
        }
      },
    },
  },
  isUrgentHiring: {
    type: dt.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  benefitsIncluded: {
    type: dt.ARRAY(dt.STRING),
  },
  description: {
    type: dt.TEXT,
    set(value) {
      if (value !== null) {
        const gzippedBuffer = gzipSync(value);
        this.setDataValue("description", gzippedBuffer.toString("base64"));
      } else this.setDataValue("description", null);
    },
    get() {
      const storedValue = this.getDataValue("description");
      if (storedValue === null) return null;
      const gzippedBuffer = Buffer.from(storedValue, "base64");
      const unzippedBuffer = gunzipSync(gzippedBuffer);
      return unzippedBuffer.toString();
    },
  },
  experienceRequired: {
    type: dt.STRING,
    values: experience,
    allowNull: false,
    defaultValue: "Fresher",
  },
  education: {
    type: dt.ARRAY(dt.JSON),
    defaultValue: [{ passed: "12th" }],
  },
  minAge: {
    type: dt.INTEGER,
    defaultValue: 15,
  },
  maxAge: {
    type: dt.INTEGER,
    defaultValue: 80,
  },
  gender: {
    type: dt.STRING,
    values: Object.values(genders),
    defaultValue: genders.ANY,
  },
  requirements: {
    type: dt.ARRAY(dt.JSON),
  },
  tags: {
    type: dt.ARRAY(dt.STRING),
  },
  url: dt.STRING,
});

export default PrivateJob;
