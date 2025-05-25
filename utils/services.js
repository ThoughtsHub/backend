import { nodeEnv } from "../env/env.config.js";
import { logBad, logDbErr } from "../services/LogService.js";

// service result
export const sRes = (
  code = serviceCodes.DATABASE_ERR,
  info = null,
  err = null
) => {
  if (!nodeEnv.production) console.log({ code, info, err });
  return { code: code[0], message: code[1], info, err };
};

export const serviceCodes = {
  OK: ["Success", "OK"],
  DB_ERR: ["Database Error", "Database Error"],
  BAD_ID: ["Bad Id", "Invalid Id given"],
  INVALID_ID: ["Invalid Id", "Invalid Id given"],
};

export const serviceResultBadHandler = (
  result,
  res,
  title = "Request failed",
  desc = "",
  writeCode = false
) => {
  if (result.code === serviceCodes.DB_ERR[0]) {
    logDbErr(
      { info: result.info, body: res.originalBody, query: res.originalQuery },
      result.err
    );
    res.serverError();
  } else if (result.code === serviceCodes.BAD_ID[0]) {
    logBad(
      title,
      `${desc}${writeCode ? `\nError Message : ${result.code}` : ""}`,
      { info: result.info, body: res.originalBody, query: res.originalQuery }
    );
    res.failure(`${result.message} : ${Object.keys(result.info).join(", ")}`);
  } else if (result.code !== serviceCodes.OK[0]) {
    logBad(
      title,
      `${desc}${writeCode ? `\nError Message : ${result.code}` : ""}`,
      { info: result.info, body: res.originalBody, query: res.originalQuery }
    );
    res.failure(result.message);
  } else return false;
  return true;
};
