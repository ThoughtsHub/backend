import { strToArray } from "./arrays.js";

export const parseFields = (fields = []) => {
  fields = strToArray(fields);

  const values = { fields: [], reqFields: [] };

  for (let field of fields) {
    if (field.at(-1) === "*") {
      field = field.substring(0, field.length - 1);
      values.reqFields.push(field);
    }
    values.fields.push(field);
  }

  return values;
};
