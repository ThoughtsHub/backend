import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";
import baseModel from "./BaseModel.js";

const PoemPost = db.define(
  "PoemPost",
  {
    id: { ...ATTR.ID },
    title: { ...ATTR.STR_REQ },
    body: dt.TEXT,
    images: dt.ARRAY(dt.STRING),
    caption: dt.STRING,
    category: dt.STRING,
    genres: dt.STRING,
    color: dt.STRING,
    alignment: dt.STRING,
    handle: { ...ATTR.UNIQ_STR_REQ },
    likes: { ...ATTR.INTEGER },
    downvotes: { ...ATTR.INTEGER },
    shares: { ...ATTR.INTEGER },
    ...baseModel.config,
  },
  { ...baseModel.options }
);

export default PoemPost;
