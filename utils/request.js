import util from "util";

const nullUndefined = [null, undefined];

/**
 * A convinient way to handle request body
 */
class ReqBody {
  /**
   * creates an object with the given fields,\
   * if no fields given, copies the object
   * @param {object} body
   * @param {string[] | []} fields
   */
  constructor(body = {}, fields = []) {
    this.values = {};
    if (fields.length === 0) fields = Object.keys(body);
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
   * Same as bulkGet but returns a map containing fields as keys and thier
   * getResult as thier value
   * @param {string | string[]} fields
   * @returns {Map}
   */
  bulkGetMap = (fields) => {
    const _fields = typeof fields === "string" ? fields.split(" ") : fields;
    let getResults = [];
    _fields.forEach((field) => (getResults[field] = this.values[field]));
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
   * Returns true if value of field is of type string
   * @param {string} field
   * @returns {boolean}
   */
  isString = (field) => typeof this.values[field] === "string";

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

  /**
   * Removes all the null values from the body
   */
  clearNulls = () => {
    const keys = Object.keys(this.values);
    keys.forEach((field) => (this.isNull(field) ? this.del(field) : null));
  };

  /**
   * Converts the value of a field to string
   * @param {string} field
   */
  toString = (field) =>
    !this.isNull(field) && this.set(field, String(this.get(field)));

  /**
   * Converts the value of field to its number equivalent, if not possible, sets the value to default value
   * @param {string} field
   * @param {number} defaultValue
   */
  toNumber = (field, defaultValue = 0) => {
    const value = this.get(field);
    this.set(field, Number(value));
    if (isNaN(this.get(field))) this.set(field, defaultValue);
  };

  /**
   * Customize JSON serialization
   * @returns {Object}
   */
  toJSON() {
    return this.values; // Ensures JSON.stringify returns the values
  }

  /**
   * Customize Node.js inspection
   * @returns {Object}
   */
  [util.inspect.custom](depth, options) {
    return this.values; // Makes console.log show the values
  }
}

export default ReqBody;
