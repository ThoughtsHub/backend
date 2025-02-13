import retry from "../utils/reconnect.js";
import { client, db } from "./clients.js";

/**
 * Connects to redis client
 */
const connectToRedis = async () => {
  await retry(async () => {
    try {
      await client.connect();

      console.log(`Connected to Redis`);
      return true;
    } catch (err) {
      console.log(err);
      console.log("Retrying...");
    }
    return false;
  });
};

/**
 * Connects to PostgreSql database
 */
const connectToPg = async () => {
  await retry(async () => {
    try {
      await db.authenticate();

      console.log(`Connected to PostgreSql`);
      return true;
    } catch (err) {
      console.log(err);
      console.log("Retrying...");
    }
    return false;
  });
};

const connectDb = {
  redis: connectToRedis,
  pg: connectToPg,
};

export default connectDb;
