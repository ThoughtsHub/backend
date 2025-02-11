import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

export const UPVOTE = "upvote";
export const DOWNVOTE = "downvote";

const Vote = db.define(
  "Vote",
  {
    id: attr.id,
    type: {
      type: dt.ENUM(UPVOTE, DOWNVOTE),
      set(value) {
        if (value === UPVOTE || value > 0) this.setDataValue("type", UPVOTE);
        else this.setDataValue("type", DOWNVOTE);
      },
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

export default Vote;
