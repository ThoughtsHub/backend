/**
 * converts the string/ array string to array of string
 * @param {string | string[]} fields
 * @returns {string[]}
 */
export const strToArray = (fields) =>
  Array.isArray(fields) ? fields : fields.split(" ");
