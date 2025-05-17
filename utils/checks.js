export const isString = (val) => typeof val === "string";

export const isNull = (val) => val === null;

export const isNumber = (val) => typeof val === "number" && !isNaN(val);
