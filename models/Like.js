import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

const Like = db.define(
  "Like",
  {},
  {
    indexes: [
      {
        type: "UNIQUE",
        fields: ["creativityId", "profileId"],
      },
    ],
  }
);

export default Like;
