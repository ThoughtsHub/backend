import { strToArray } from "../utils/arrays.js";

class ReqBody {
  constructor(body = {}, fields = []) {
    this.data = {};
    fields = strToArray(fields);
    if (!Array.isArray(fields) || fields.length === 0) this.data = body;
    else fields.forEach((f) => (this.data[f] = body[f] ?? null));
  }

  setFields = (fields = []) => {
    fields = strToArray(fields);
    let data = {};
    fields.forEach((f) => (data[f] = this.get(f, null)));
    this.data = data;
  };

  get = (field, def = null) => this.data[field] ?? def;

  set = (field, value) => (this.data[field] = value);

  del = (field) => delete this.data[field];

  bulkGet = (fields = [], def = null) => {
    fields = strToArray(fields);
    return fields.map((f) => this.get(f, def));
  };

  bulkGetMap = (fields = [], def = null) => {
    fields = strToArray(fields);
    const data = {};
    fields.forEach((f) => (data[f] = this.get(f, def)));
    return data;
  };

  bulkSet = (fields = [], def = null) => {
    fields = strToArray(fields);
    fields.forEach((f) => this.set(f, def));
  };

  isNull = (field) => this.get(field) === null;

  isUndefined = (field) => this.get(field) === undefined;

  isNuldefined = (field) => this.isNull(field) || this.isUndefined(field);

  anyNuldefined = (fields = [], joinSeparator = null) => {
    fields = strToArray(fields);
    let nulFields = [];
    fields.forEach((f) => (this.isNuldefined(f) ? nulFields.push(f) : null));
    if (joinSeparator === null) return nulFields;
    return nulFields.join(joinSeparator);
  };

  allNuldefined = (fields = []) => {
    fields = strToArray(fields);
    return fields.every((f) => this.isNuldefined(f));
  };

  getNotNuldefined = (fields = []) => {
    fields = strToArray(fields);
    for (const f of fields) if (!this.isNuldefined(f)) return f;
    return null;
  };

  isNumber = (field) => {
    let value = this.get(field);
    return typeof value === "number" && !isNaN(value);
  };

  isTrue = (field) => {
    return this.get(field) === true;
  };

  toNumber = (field, def = 0) => {
    const value = this.get(field);
    try {
      const numValue = this.isNumber(field) ? value : Number(value);
      if (isNaN(numValue)) throw new Error("Not a number");
      return numValue;
    } catch {
      return def ?? 0;
    }
  };

  removeNulDefined = () => {
    const removeFields = [];
    for (const key in this.data)
      if (Object.prototype.hasOwnProperty.call(this.data, key))
        if (this.isNuldefined(key)) removeFields.push(key);

    for (const field of removeFields) this.del(field);
  };
}

const handleBody = (req, _, next) => {
  req.body = new ReqBody(req.body);
  req.query = new ReqBody(req.query);
  next();
};

export default handleBody;
export const UpgradedBody = ReqBody;
