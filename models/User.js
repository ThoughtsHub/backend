import { DataTypes as dt } from "sequelize";
import { FALSE_BOOL, ID, UNIQUE_STR } from "../constants/db.js";
import { db } from "../db/clients.js";
import bcryptjs from "bcryptjs";
import { PASSWORD } from "../constants/env.js";

const User = db.define("User", {
  id: ID,
  username: UNIQUE_STR,
  blocked: FALSE_BOOL,
  verified: FALSE_BOOL,
  email: { ...UNIQUE_STR, validate: { isEmail: true } },
  mobile: UNIQUE_STR,
  usernameSet: FALSE_BOOL,
  password: {
    type: dt.STRING,
    allowNull: false,
    set(value) {
      const updatedPassword = PASSWORD.SECRET + value; // join secret to password
      this.setDataValue(
        "password",
        bcryptjs.hashSync(updatedPassword, pass.salt)
      ); // hash password and save
    },
  },
});

export default User;
