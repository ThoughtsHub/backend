import { DataTypes as dt } from "sequelize";
import { ID, STR_REQ, UNIQ_STR_REQ } from "../constants/db.js";
import { db } from "../db/clients.js";

const News = db.define(
  "News",
  {
    id: ID,
    title: STR_REQ,
    description: dt.TEXT,
    images: dt.ARRAY(dt.STRING),
    tags: dt.ARRAY(dt.STRING),
    category: dt.ARRAY(dt.STRING),
    handle: UNIQ_STR_REQ,
  },
  { tableName: "News" }
);

export default News;
