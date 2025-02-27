const nullUndefined = [null, undefined];

/**
 * A convinient way to handle request body
 */
class ReqBody {
  constructor(body = {}, fields = []) {
    this.values = {};
    for (const field of fields) {
      this.values[field] = body[field];
    }
  }

  /**
   * Gets the value of a field in the body
   * @param {string} field
   * @returns {any}
   */
  get = (field) => this.values[field];

  /**
   * Returns an array of result for multiple fields in order asked for
   * @param {string | string[]} fields
   * @returns {any[]}
   */
  bulkGet = (fields) => {
    const _fields = typeof fields === "string" ? fields.split(" ") : fields;
    let getResults = [];
    _fields.forEach((field) => getResults.push(this.values[field]));
    return getResults;
  };

  /**
   * Sets a new value in a field of body
   * @param {string} field
   * @param {any} newValue
   */
  set = (field, newValue) => {
    this.values[field] = newValue;
  };

  /**
   * Deletes a field
   * @param {string} field
   */
  del = (field) => {
    delete this.values[field];
  };

  /**
   * Returns true if field is null or undefined
   * @param {string} field
   * @returns {boolean}
   */
  isNull = (field) => {
    return nullUndefined.includes(this.values[field]);
  };

  /**
   * Returns true if any field from given fields is null or undefined
   * @param {string | string[]} fields
   * @returns {boolean}
   */
  anyFieldNull = (fields) => {
    const _fields = typeof fields === "string" ? fields.split(" ") : fields;
    return _fields.some((field) => nullUndefined.includes(this.values[field]));
  };

  /**
   * Returns true if all values in the body are null or undefined
   * @returns {boolean}
   */
  allNull = () => {
    return Object.values(this.values).every((value) =>
      nullUndefined.includes(value)
    );
  };

  /**
   * Returns true if all field in the given fields have value null or undefined
   * @param {string | string[]} fields
   * @returns {boolean}
   */
  fieldsNull = (fields) => {
    const _fields = typeof fields === "string" ? fields.split(" ") : fields;
    return _fields.every((field) => nullUndefined.includes(this.values[field]));
  };

  /**
   * Returns the first non null field from the given fields \
   * with its fieldName as 'key' and its fieldValue as 'keyVal'
   * @param {string | string[]} fields
   * @returns {[key, keyVal]}
   */
  getNonNullField = (fields) => {
    const _fields = typeof fields === "string" ? fields.split(" ") : fields;
    for (const field of _fields) {
      if (!nullUndefined.includes(this.values[field]))
        return [field, this.values[field]];
    }

    return null;
  };

  /**
   * Returns true if field is not an array
   * @param {string} field
   * @returns {boolean}
   */
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
