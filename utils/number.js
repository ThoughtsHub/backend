import { isNumber, isString } from "./checks.js";

/**
 *
 * @param {any} val
 * @returns {number}
 */
export const toNumber = (val) => {
  if (isNumber(val)) return val;
  if (isString(val) && isNumber(Number(val))) return Number(val);
  return 0;
};
