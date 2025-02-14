const allNull = (...values) => {
  let result = true;
  for (const value of values) result = result && value === null;
  return result;
};

/**
 * Creates an array with first to be the body after excluding
 * specified exclude fields
 * exclude values in order, after updated body
 * @param {object} body
 * @param {Array} exclude
 * @param {Boolean} excludeTimestamps
 * @returns {[object, any | null]}
 */
const getData = (body = {}, exclude = [], excludeTimestamps = true) => {
  const data = [];
  for (const exclusion of exclude) {
    data.push(body[exclusion] ?? null);
    delete body[exclusion];
  }
  if (excludeTimestamps === true) {
    data.push(body.createdAt ?? null);
    data.push(body.updatedAt ?? null);
  }

  data = [body, ...data];
  return data;
};

/**
 * Gives an object with fields value
 * @param {object} body
 * @param {[]} fields
 * @returns {object}
 */
const getData_ = (body = {}, fields = []) => {
  const data = {};
  for (const field of fields) data[field] = body[field] ?? null;
  return data;
};

const _req = {
  allNull,
  getDataWEx: getData,
  getDataO: getData_,
};

export default _req;
