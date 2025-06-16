// Possible loaded data within capacity

import fs from "fs";

const cu_fields_file = fs
  .readFileSync("./data/loaded_data/cu_fields.json")
  .toString();

export const fields = JSON.parse(cu_fields_file);
