import dotenv from "dotenv";

dotenv.config();

export const server = {
  host: process.env.host,
  port: process.env.port,
};

export const pg = {
  server: process.env.pg_server,
  database: process.env.pg_database,
  username: process.env.pg_username,
  password: process.env.pg_password,
};

export const redis = {
  uri: process.env.redis_uri,
};

const env = { server, pg, redis };

export default env;
