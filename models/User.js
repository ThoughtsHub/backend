import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";
import bcryptjs from "bcryptjs";
import { PASSWORD } from "../constants/env.js";

const User = db.define("User", {
  id: { ...ATTR.ID },
  username: { ...ATTR.UNIQUE_STR },
  blocked: { ...ATTR.FALSE_BOOL },
  verified: { ...ATTR.FALSE_BOOL },
  email: { ...ATTR.UNIQUE_STR, validate: { isEmail: true } },
  mobile: { ...ATTR.UNIQUE_STR },
  usernameSet: { ...ATTR.FALSE_BOOL },
  password: {
    type: dt.STRING,
    allowNull: false,
    set(value) {
      const updatedPassword = PASSWORD.SECRET + value; // join secret to password
      this.setDataValue("password", bcryptjs.hashSync(updatedPassword, 10)); // hash password and save
    },
  },
});

export default User;
