import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";
import baseModel from "./BaseModel.js";

const News = db.define(
  "News",
  {
    id: { ...ATTR.ID },
    title: { ...ATTR.STR_REQ },
    description: dt.TEXT,
    images: dt.ARRAY(dt.STRING),
    tags: dt.ARRAY(dt.STRING),
    category: dt.ARRAY(dt.STRING),
    handle: { ...ATTR.UNIQ_STR_REQ },
    newsUrl: { ...ATTR.STR_REQ },
    ...baseModel.config,
  },
  { tableName: "News", ...baseModel.options }
);

export default News;
