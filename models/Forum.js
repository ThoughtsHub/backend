import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";
import baseModel from "./BaseModel.js";

const Forum = db.define(
  "Forum",
  {
    id: { ...ATTR.ID },
    title: { ...ATTR.STR_REQ },
    description: dt.TEXT,
    images: dt.ARRAY(dt.STRING),
    handle: { ...ATTR.UNIQ_STR_REQ },
    upvotes: { ...ATTR.INTEGER },
    downvotes: { ...ATTR.INTEGER },
    comments: { ...ATTR.INTEGER },
    ...baseModel.config,
  },
  { ...baseModel.options }
);

export default Forum;
