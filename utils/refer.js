import { v4 as uuidv4 } from "uuid";

export const createReferralCode = (str = "") => {
  const randomStr = uuidv4().replaceAll("-", "");
  const referCode =
    randomStr.slice(0, 12) +
    "_" +
    (str.length > 8
      ? str.slice(0, 8)
      : str + randomStr.slice(14, 14 + 8 - str.length));

  return referCode;
};
