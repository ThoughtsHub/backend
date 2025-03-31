import fs from "fs";
import path from "path";

const file = (writeDir, filename) => {
  return writeDir === null ? filename : path.join(writeDir, filename);
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

  log() {}

  error(err, message = "Error", user = null) {
    const writeMessage = `${this.title(user)} : ${message}\n${err}\n----\n`;
    this.writeError(writeMessage);
  }

  info(message = "", user = null, variables = {}) {
    let writeMessage = `${this.title(user)} : ${message}\n`;
    for (const vars in variables) {
      writeMessage += `${vars} : \n`;
      writeMessage += `${variables[vars]}\n--\n`;
    }
    writeMessage += "----\n";
    this.writeInfo(writeMessage);
  }

  warning(message = "", user = null, variables = {}) {
    let writeMessage = `${this.title(user)} : ${message}\n`;
    for (const vars in variables) {
      writeMessage += `${vars} : \n`;
      writeMessage += `${variables[vars]}\n--\n`;
    }
    writeMessage += "----\n";
    this.writeWarning(writeMessage);
  }

  title(user = "random") {
    return `[${new Date(Date.now()).toLocaleString()}] (${
      user === null ? "random" : user
    })`;
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
    else this.alternateFunction(message);
  }
}

export default Logger;
