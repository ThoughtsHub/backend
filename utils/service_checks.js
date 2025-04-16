import { sResult } from "./service_return.js";
import { SERVICE_CODE } from "./service_status_codes";

export const idInvalidOrMissing = (id = null, nameOfId = "") => {
  if (id === null)
    return sResult(
      SERVICE_CODE.ID_MISSING,
      `${nameOfId === "" ? "" : nameOfId + " "}Id not provided`
    );
  if (typeof id !== "string")
    return sResult(
      SERVICE_CODE.ID_INVALID,
      `Invalid ${nameOfId === "" ? "" : nameOfId + " "}Id`
    );

  return false;
};

export const reqFieldsNotGiven = (body, reqFields) => {
  const reqFieldNotGiven = body.anyNuldefined(reqFields, ", ");
  if (reqFieldNotGiven.length !== 0)
    return sResult(
      SERVICE_CODE.REQ_FIELDS_MISSING,
      `Required: ${reqFieldNotGiven}`
    );

  return false;
};
