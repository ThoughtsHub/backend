import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";
import { gzipSync, gunzipSync } from "zlib";

const Profile = db.define("Profile", {
  id: attr.id,
  pfp: dt.STRING, // profile picture
  firstName: {
    type: dt.STRING,
    allowNull: false,
  },
  middleName: dt.STRING,
  lastName: dt.STRING,
  displayName: dt.STRING,
  age: dt.INTEGER,
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
  handle: {
    type: dt.STRING,
    allowNull: false,
    unique: true,
  },
  likes: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }, // profile likes
  followers: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  following: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  groups: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }, // groups in which the user is
  news: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  articles: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  posts: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  forums: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  booksIssued: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }, // how many books he has issued
  wallet: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }, // money he has in his wallet for purchasing stuff
});

export default Profile;
