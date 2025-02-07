import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

const Address = db.define("Address", {
  id: attr.id,
  title: dt.STRING,
  description: dt.TEXT,
  street: {
    type: dt.STRING,
    allowNull: false,
  },
  street2: dt.STRING,
  landmark: dt.STRING,
  city: {
    type: dt.STRING,
    allowNull: false,
  },
  state: {
    type: dt.STRING,
    allowNull: false,
  },
  country: {
    type: dt.STRING,
    allowNull: false,
  },
  zipCode: {
    type: dt.STRING,
    allowNull: false,
  },
});

export default Address;
