import { isNumber, isString } from "./checks.js";

/**
 *
 * @param {any} val
 * @returns {number}
 */
export const toNumber = (val) => {
  if (isNumber(val)) return val;
  try {
    let n = Number(val);
    if (isNumber(n)) return n;
  } catch (err) {
    return 0;
  }
  return 0;
};
