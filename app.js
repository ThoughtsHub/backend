import initAssociations from "./associations/associations.js";
import { connectToPg } from "./db/pg.js";
import { connectToRedis } from "./db/redis.js";
import env from "./env/env.config.js";
import server from "./server/socket.js";
import shutdown from "./utils/shutdown.js";

await connectToRedis();
await connectToPg();
await initAssociations();

server.listen(env.server.port, env.server.host, () => {
  console.log(`Server started on http://${env.server.host}:${env.server.port}`);
});

process.on("SIGINT", async () => {
  await shutdown(server);
});
