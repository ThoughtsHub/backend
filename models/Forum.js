import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";
import { gzipSync, gunzipSync } from "zlib";

const Forum = db.define("Forum", {
  id: attr.id,
  title: {
    type: dt.STRING,
    allowNull: false,
  },
  description: {
    type: dt.STRING,
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
  images: dt.ARRAY(dt.STRING),
  upvotes: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  downvotes: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  comments: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  shares: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  reports: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  votes: {
    type: dt.VIRTUAL,
    get() {
      return this.upvotes - this.downvotes;
    },
  },
  handle: {
    type: dt.STRING,
    allowNull: false,
    unique: true,
  },
});

export default Forum;
