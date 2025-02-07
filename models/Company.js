import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";
import { gzipSync, gunzipSync } from "zlib";

const Company = db.define("Company", {
  id: attr.id,
  name: {
    type: dt.STRING,
    allowNull: false,
  },
  about: {
    type: dt.TEXT,
    set(value) {
      if (value !== null) {
        const gzippedBuffer = gzipSync(value);
        this.setDataValue("about", gzippedBuffer.toString("base64"));
      } else this.setDataValue("about", null);
    },
    get() {
      const storedValue = this.getDataValue("about");
      if (storedValue === null) return null;
      const gzippedBuffer = Buffer.from(storedValue, "base64");
      const unzippedBuffer = gunzipSync(gzippedBuffer);
      return unzippedBuffer.toString();
    },
  },
});

export default Company;
