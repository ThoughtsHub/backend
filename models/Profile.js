import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

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
      if (value !== null)
        value = Buffer.from(value, "utf-8").toString("base64");
      this.setDataValue("about", value);
    },
    get() {
      let value = this.getDataValue("about");
      if (value !== null)
        value = Buffer.from(value, "base64").toString("utf-8");
      return value;
    },
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
