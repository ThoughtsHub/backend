import { timestampsKeys } from "../constants/timestamps.js";
import Log, { logTypes, RT } from "../models/Log.js";
import { isNumber } from "../utils/checks.js";
import { Validate } from "./ValidationService.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { RC } from "../utils/codes.js";

const logsLimit = 30;

class LogService {
  static satisfyBasic = (values) => {
    const { text, description } = values;
    return Validate.title(text) && Validate.body(description);
  };

  static satisfyLine = (values) => Validate.title(values.line);

  static satisfyLines = (values) => Validate.body(values.lines);

  static satisfyResponse = (values) => {
    const {
      responseCode,
      responseType,
      responseTitle,
      responseDescription,
      responseValues = null,
    } = values;

    return (
      Validate.responseCode(responseCode) &&
      Validate.responseType(responseType) &&
      Validate.title(responseTitle) &&
      Validate.responseDesc(responseDescription) &&
      Validate.responseValues(responseValues)
    );
  };

  static satisfyDatabaseOps = (values) => {
    const {
      databaseOpsCode,
      databaseOpsType,
      databaseOpsTitle,
      databaseOpsDescription,
      databaseOpsValues,
    } = values;

    return (
      Validate.responseCode(databaseOpsCode) &&
      Validate.responseType(databaseOpsType) &&
      Validate.title(databaseOpsTitle) &&
      Validate.responseDesc(databaseOpsDescription) &&
      Validate.responseValues(databaseOpsValues)
    );
  };

  /**
   *
   * @param {{line: string, lines: string, text: string, description: string, responseCode: number,  responseTitle: string, responseDescription: string | null, responseType: "OK" | "WARNING" | "ERROR", responseValues: object,databaseOpsCode: number, databaseOpsType: "OK" | "WARNING" |"ERROR", databaseOpsTitle: string, databaseOpsDescription: string | null, databaseOpsValues: object }} values
   */
  static create = async (values) => {
    console.log(values)
    let type = null;
    if (LogService.satisfyBasic(values)) type = logTypes.Basic;
    else if (LogService.satisfyLine(values)) type = logTypes.SingleLine;
    else if (LogService.satisfyLines(values)) type = logTypes.MultipleLines;
    else if (LogService.satisfyResponse(values)) type = logTypes.Response;
    else if (LogService.satisfyDatabaseOps(values)) type = logTypes.DatabaseOps;

    if (type === null)
      throw new Error("Type needs to be from the predefined Log Types");

    try {
      await Log.create({ ...values, type });
    } catch (err) {
      console.log(err);
    }
  };

  static getByOffset = async (offset) => {
    if (!isNumber(offset)) offset = 0;

    try {
      let logs = await Log.findAll({
        offset,
        limit: logsLimit,
        order: [[timestampsKeys.createdAt, "desc"]],
      });
      logs = logs.map((l) => l.get({ plain: true }));

      return sRes(serviceCodes.OK, { logs });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset }, err);
    }
  };
}

export const Log_ = LogService;

const log = Log_.create;
export default log;

export const logServerErr = (err) => {
  log({
    responseCode: RC.INTERNAL_SERVER_ERROR,
    responseType: RT.ERROR,
    responseTitle: "Internal server error",
    responseDescription: "Error",
    responseValues: { err },
  });
};

export const logOk = (title, desc, values) => {
  log({
    responseCode: RC.OK,
    responseType: RT.OK,
    responseTitle: title,
    responseDescription: desc,
    responseValues: values,
  });
};

export const logBad = (title, desc, values) => {
  log({
    responseCode: RC.BAD_REQUEST,
    responseType: RT.WARNING,
    responseTitle: title,
    responseDescription: desc,
    responseValues: values,
  });
};
