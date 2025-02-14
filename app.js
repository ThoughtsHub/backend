import { APP, BASE_URL } from "./constants/env.js"; // env variables
import connectDb from "./db/connect.js";
import closeDb from "./db/close.js";
import initAssociation from "./associations/association.js";
import server from "./server/socket.js";
import createAdmin from "./scripts/admin.js";

const port = APP.PORT;

// Connect to databases
connectDb.redis();
connectDb.pg();
initAssociation(); // link all the tables

createAdmin();

server.listen(port, APP.HOST, () => {
  console.log(`Application started on ${BASE_URL}`);
});

// shutdown of the application
{
  const shutDown = async () => {
    // Close running services here
    server.close();
    await closeDb.redis();
    await closeDb.pg();

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
