import fs from "fs";

class Logger {
  constructor(filename) {
    this.filename = filename;
  }

  log() {}

  error(err, message = "Error", user = null) {
    const writeMessage = `${this.title(user)} : ${message}\n${err}\n---\n`;
    this.write(writeMessage);
  }

  info() {}

  title(user = "random") {
    return `[${new Date(Date.now()).toLocaleString()}] (${
      user === null ? "random" : user
    })`;
  }

  write(message) {
    fs.appendFileSync(this.filename, message);
  }
}

export default Logger;
