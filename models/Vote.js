import { DataTypes as dt } from "sequelize";
import { ID } from "../constants/db.js";
import { db } from "../db/clients.js";

export const TYPE = {
  UPVOTE: "Upvote",
  DOWNVOTE: "Downvote",
};

const Vote = db.define(
  "Vote",
  {
    id: ID,
    vote: dt.ENUM(Object.values(TYPE)),
  },
  { tableName: "ForumVotes" }
);

export default Vote;
