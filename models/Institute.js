import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import fs from "fs";

const cu_fields = JSON.parse(
  fs.readFileSync("./data/loaded_data/cu_fields.json").toString()
);
const fields = {};
for (const field of cu_fields)
  fields[field] = { ...types.STRING, defaultValue: null };

const Institute = db.define(
  "Institute",
  {
    id: { ...types.ID },
    ...fields,
    universityId: {
      ...types.FOREIGN_ID,
      references: { model: "Institutes", key: "id" },
    },
    imageUrl: { ...types.STRING, defaultValue: null },
    about: { ...types.TEXT },
    rating: { ...types.DOUBLE, defaultValue: 0 },
    ratedBy: { ...types.INT_REQ_0 },
    reviews: { ...types.INT_REQ_0 },
    discussions: { ...types.INT_REQ_0 },
    ...timestamps,
  },
  { hooks }
);

export default Institute;
