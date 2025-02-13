import { client, db } from "./clients.js";

/**
 * Close redis connection
 */
const closeRedis = async () => {
  try {
    await client.disconnect();

    console.log(`Closed Redis`);
  } catch (err) {
    console.log(err);
    console.log(`Failed to close Redis`);
  }
};

/**
 * Close Pg connection
 */
const closePg = async () => {
  try {
    await db.close();

    console.log(`Closed PostgreSql`);
  } catch (err) {
    console.log(err);
    console.log(`Failed to close PostgreSql`);
  }
};

const closeDb = {
  redis: closeRedis,
  pg: closePg,
};

export default closeDb;
