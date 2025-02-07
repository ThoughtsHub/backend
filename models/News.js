import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";
import { gzipSync, gunzipSync } from "zlib";

const News = db.define(
  "News",
  {
    id: attr.id,
    title: {
      type: dt.STRING,
      allowNull: false,
    },
    content: {
      type: dt.TEXT,
      allowNull: false,
      set(value) {
        if (value !== null) {
          const gzippedBuffer = gzipSync(value);
          this.setDataValue("content", gzippedBuffer.toString("base64"));
        } else this.setDataValue("content", null);
      },
      get() {
        const storedValue = this.getDataValue("content");
        if (storedValue === null) return null;
        const gzippedBuffer = Buffer.from(storedValue, "base64");
        const unzippedBuffer = gunzipSync(gzippedBuffer);
        return unzippedBuffer.toString();
      },
    },
    images: dt.ARRAY(dt.STRING),
    tags: dt.ARRAY(dt.STRING),
    category: dt.ARRAY(dt.STRING),
  },
  { tableName: "News" }
);

export default News;
