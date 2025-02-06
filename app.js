import _env from "./constants/env.js"; // env variables
import _connect from "./db/connect.js"; // db
import _close from "./db/close.js"; // db
import initAssociation from "./associations/association.js";
import server from "./server/socket.js"; // server

const port = _env.app.PORT;

// Connect to databases
await _connect.nosql();
await _connect.sql();
initAssociation(); // link all the tables

server.listen(port, _env.app.HOST, () => {
  console.log(`Application started on http://${_env.app.HOST}:${port}`);
});

// shutdown of the application
{
  const shutDown = async () => {
    // Close running services here
    server.close();
    await _close.nosql();
    await _close.sql();

    console.debug("Gracefully closing the application");
  };

  process.on("SIGINT", async () => {
    console.debug("Recieved SIGINT");
    await shutDown();
  });

  process.on("SIGTERM", async () => {
    console.debug("Recieved SIGTERM/(nodemon restarts)");
    await shutDown();
  });
}
