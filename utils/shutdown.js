import { closePg } from "../db/pg.js";
import { closeRedis, flushCache } from "../db/redis.js";

const shutdown = async (server) => {
  console.log("Gracefully shutting down");

  await closeRedis();
  await closePg();

  // await flushCache(); // cache flush

  server.close();
  console.log("Server closed");
  console.log("Shutdown complete!");
};

export default shutdown;
