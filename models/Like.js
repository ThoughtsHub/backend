import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";

const Like = db.define("Like", {
  id: { ...ATTR.ID },
});

export default Like;
