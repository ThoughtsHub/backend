import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const News = db.define(
  "News",
  {
    id: { ...types.ID },
    title: { ...types.STR_REQ },
    body: { ...types.TEXT_REQ },
    image: { ...types.STRING },
    newsUrl: { ...types.STRING },
    category: { ...types.STR_REQ },
    ...timestamps,
  },
  { hooks, tableName: "News" }
);

export default News;
