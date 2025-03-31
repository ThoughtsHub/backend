import Logger from "../utils/logging.js";

const logger = new Logger({
  writeDir: "./logs",
  logFilename: "logs.log",
  errorFilename: "errors.log",
  infoFilename: "info.log",
  warnFilename: "warnings.log",
});

export default logger;
