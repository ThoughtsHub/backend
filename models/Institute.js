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
    ...timestamps,
  },
  { hooks }
);

export default Institute;
