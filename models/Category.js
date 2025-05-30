import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const Category = db.define(
  "Category",
  {
    id: { ...types.ID },
    name: { ...types.UNIQUE_STR_REQ },
    ...timestamps,
  },
  { hooks }
);

export default Category;
