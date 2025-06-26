import readline from "readline";

function updateLoader(current, total) {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(
    `Completed : ${current}/${total} (${((current / total) * 100).toFixed(1)}%)`
  );
}

export default updateLoader;
