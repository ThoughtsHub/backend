import fs, { write } from "fs";
import path from "path";

const file = (writeDir, filename) => {
  return writeDir === null ? filename : path.join(writeDir, filename);
};

const objToString = (obj) => {
  if (typeof obj === "object") return JSON.stringify(obj, null, 2);
  else return obj;
};

const errorToString = (error) => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\nStack Trace:\n${error.stack}`;
  }
  return String(error);
};

class Logger {
  constructor({
    writeDir = null,
    logFilename,
    errorFilename,
    infoFilename,
    warnFilename,
    writeAllowed = true,
    alternateFunction = console.log,
  }) {
    this.logFilename = file(writeDir, logFilename);
    this.errorFilename = file(writeDir, errorFilename);
    this.infoFilename = file(writeDir, infoFilename);
    this.warnFilename = file(writeDir, warnFilename);
    this.writeAllowed = writeAllowed;
    this.alternateFunction = alternateFunction;
  }

  allowedToWrite = () => this.writeAllowed === true;

  log(title = "Log", message) {
    const writeMessage = `****\n\n${title}\n\n${message}\n\n****\n\n`;
    this.writeLog(writeMessage);
  }

  error(message = "Error", err, user = null, variables = {}) {
    let writeMessage = `${this.title(user)} : ${message}\n--\n`;
    writeMessage += `Error : ${errorToString(err)}\n--\n`;
    for (const vars in variables)
      writeMessage += `${vars} : ${objToString(variables[vars])}\n--\n`;
    writeMessage += "----\n";
    this.writeError(writeMessage);
  }

  info(message = "", user = null, variables = {}) {
    let writeMessage = `${this.title(user)} : ${message}\n--\n`;
    for (const vars in variables)
      writeMessage += `${vars} : ${objToString(variables[vars])}\n--\n`;
    writeMessage += "----\n";
    this.writeInfo(writeMessage);
    this.log(message, writeMessage);
  }

  warning(message = "", user = null, variables = {}) {
    let writeMessage = `${this.title(user)} : ${message}\n--\n`;
    for (const vars in variables)
      writeMessage += `${vars} : ${objToString(variables[vars])}\n--\n`;
    writeMessage += "----\n";
    this.writeWarning(writeMessage);
    this.log(message, writeMessage);
  }

  title(user = { id: null, username: null }) {
    return `[${new Date(Date.now()).toLocaleString()}] (${
      (user?.id ?? null) === null ? "random" : `${user.username} [${user?.id}]`
    })`;
  }

  writeLog(message) {
    this.write(this.logFilename, message);
  }

  writeError(message) {
    this.write(this.errorFilename, message);
  }

  writeInfo(message) {
    this.write(this.infoFilename, message);
  }

  writeWarning(message) {
    this.write(this.warnFilename, message);
  }

  write(filename, message) {
    if (this.allowedToWrite()) fs.appendFileSync(filename, message);
    else
      typeof this.alternateFunction === "function"
        ? this.alternateFunction(message)
        : null;
  }
}

export default Logger;
