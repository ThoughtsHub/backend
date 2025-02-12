import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";
import bcryptjs from "bcryptjs";
import pass from "../constants/password.js";

const User = db.define("User", {
  id: attr.id,
  username: {
    type: dt.STRING,
    unique: true,
  },
  password: {
    type: dt.STRING,
    allowNull: false,
    set(value) {
      const updatedPassword = pass.secret + value; // join secret and username to password
      this.setDataValue(
        "password",
        bcryptjs.hashSync(updatedPassword, pass.salt)
      ); // hash password and save
    },
  },
  blocked: {
    type: dt.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  verified: {
    type: dt.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }, // phone or email verified, meaning verified
  uploads: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  email: {
    type: dt.STRING,
    unique: true,
  },
  mobile: {
    type: dt.STRING,
    unique: true,
  },
});

export default User;
