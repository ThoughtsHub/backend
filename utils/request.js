const nullUndefined = [null, undefined];

class ReqBody {
  constructor(body = {}, fields = []) {
    this.values = {};
    for (const field of fields) {
      this.values[field] = body[field];
    }
  }

  get = (field) => this.values[field];

  set = (field, newValue) => {
    this.values[field] = newValue;
  };

  del = (field) => {
    delete this.values[field];
  };

  isNull = (field) => {
    return nullUndefined.includes(this.values[field]);
  };

  anyFieldNull = (fields) => {
    const _fields = typeof fields === "string" ? fields.split(" ") : fields;
    return _fields.some((field) => nullUndefined.includes(this.values[field]));
  };

  allNull = () => {
    return Object.values(this.values).every((value) =>
      nullUndefined.includes(value)
    );
  };

  fieldsNull = (fields) => {
    const _fields = typeof fields === "string" ? fields.split(" ") : fields;
    return _fields.every((field) => nullUndefined.includes(this.values[field]));
  };

  getNonNullField = (fields) => {
    const _fields = typeof fields === "string" ? fields.split(" ") : fields;
    for (const field of _fields) {
      if (!nullUndefined.includes(this.values[field]))
        return [field, this.values[field]];
    }

    return null;
  };

  fieldNotArray = (field) => {
    return !Array.isArray(this.values[field]);
  };

  valueOf() {
    return this.values;
  }

  toJSON() {
    return this.values;
  }
}

export default ReqBody;
