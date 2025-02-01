import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";
import links from "../constants/account_links.js";

const AccountLink = db.define("AccountLink", {
  id: attr.id,
  account: {
    type: dt.ENUM,
    values: links,
    allowNull: false,
  },
  value: {
    type: dt.STRING,
    allowNull: false,
  },
});

export default AccountLink;
