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

export const google = {
  email: process.env.google_email,
  password: process.env.google_password,
  gemini: {
    apiKey: process.env.gemini_api_key,
  },
};

export const nodeEnv = {
  production: process.env.node_env_production === "true",
};

export const puppeteer = {
  isOptions: process.env.puppeteer === "0" ? false : true,
  executablePath: process.env.puppeteer_path,
};

export const maxImageSizeFile = "./env/max_image_size.config.txt";
export const firebaseConfigFile = "./env/firebase/firebase.config.json";

const env = { server, pg, redis, google, nodeEnv, puppeteer };

export default env;
