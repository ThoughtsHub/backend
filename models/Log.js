import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

export const logTypes = {
  SingleLine: "SingleLine",
  MultipleLines: "MultipleLines",
  Response: "Response",
  DatabaseOps: "DatabaseOps",
  Basic: "Basic",
};

export const responseTypes = {
  OK: "OK",
  WARNING: "WARNING",
  ERROR: "ERROR",
};
export const RT = responseTypes;

export const databaseOpsTypes = {
  OK: "OK",
  WARNING: "WARNING",
  ERROR: "ERROR",
};
export const DOT = databaseOpsTypes;

const Log = db.define(
  "Log",
  {
    id: { ...types.ID },
    type: {
      ...types.ENUM,
      values: Object.values(logTypes),
      defaultValue: logTypes.SingleLine,
    },

    line: { ...types.STRING },

    lines: { ...types.TEXT },

    responseCode: { ...types.INTEGER },
    responseType: {
      ...types.ENUM,
      values: Object.values(responseTypes),
      defaultValue: responseTypes.OK,
    },
    responseTitle: { ...types.STRING },
    responseDescription: { ...types.TEXT },
    responseValues: { ...types.JSON },

    databaseOpsCode: { ...types.INTEGER },
    databaseOpsType: {
      ...types.ENUM,
      values: Object.values(databaseOpsTypes),
      defaultValue: databaseOpsTypes.OK,
    },
    databaseOpsTitle: { ...types.STRING },
    databaseOpsDescription: { ...types.TEXT },
    databaseOpsValues: { ...types.JSON },

    text: { ...types.STRING },
    description: { ...types.TEXT },
    ...timestamps,
  },
  { hooks, tableName: "Logs" }
);

export default Log;
