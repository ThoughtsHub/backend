import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

const Comment = db.define(
  "Comment",
  {
    id: attr.id,
    comment: {
      type: dt.TEXT,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        type: "UNIQUE",
        fields: ["forumId", "profileId"],
      },
    ],
  }
);

export default Comment;
