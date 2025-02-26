import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";
import baseModel from "./BaseModel.js";

export const TYPE = {
  UPVOTE: "Upvote",
  DOWNVOTE: "Downvote",
};

const Vote = db.define(
  "Vote",
  {
    id: { ...ATTR.ID },
    vote: dt.ENUM(Object.values(TYPE)),
    ...baseModel.config,
  },
  { tableName: "ForumVotes", ...baseModel.options }
);

export default Vote;
