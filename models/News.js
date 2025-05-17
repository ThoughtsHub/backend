import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Category from "./Category.js";

export const status = {
  Draft: "Draft",
  OnReview: "On Review",
  Published: "Published",
};

const News = db.define(
  "News",
  {
    id: { ...types.ID },
    title: { ...types.STRING },
    body: { ...types.TEXT },
    hindiTitle: { ...types.STRING },
    hindiBody: { ...types.TEXT },
    imageUrl: { ...types.STRING },
    newsUrl: { ...types.STRING },
    categoryId: {
      ...types.FOREIGN_ID,
      references: { model: Category, key: "id" },
    },
    status: {
      ...types.ENUM,
      defaultValue: status.Draft,
      values: Object.values(status),
    },
    ...timestamps,
  },
  { hooks, tableName: "News" }
);

export default News;
