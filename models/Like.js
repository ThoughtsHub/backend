import { DataTypes as dt } from "sequelize";
import { ID } from "../constants/db.js";
import { db } from "../db/clients.js";

const Like = db.define("Like", {
  id: ID,
});

export default Like;
