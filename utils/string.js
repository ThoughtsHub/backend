export const toString = (val) => {
  if ([null, undefined].includes(val)) return "";
  else return String(val);
};
