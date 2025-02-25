import dotenv from "dotenv";
dotenv.config();

export const APP = {
  HOST: process.env.HOST || "localhost",
  PORT: process.env.PORT || 3000,
  PUBLIC: "./" + "public",
};

export const APP_URL = `http://${APP.HOST}:${APP.PORT}`;
export const BASE_URL = process.env.BASE_URL;
export const REMOTE_URL = process.env.REMOTE_URL;

export const NODE_ENV = process.env.NODE_ENV || "dev";

// Authentication
export const JWT = {
  access: {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiry: process.env.ACCESS_TOKEN_EXPIRY,
  },
  refresh: {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiry: process.env.REFRESH_TOKEN_EXPIRY,
    key: process.env.REFRESH_TOKEN_KEY,
  },
};

// Redis
export const REDIS = {
  URI: process.env.REDIS_DB_URI,
};

// Postgresql database as sql db
export const POSTGRESQL = {
  HOST: process.env.PG_SERVER,
  USER: process.env.PG_USERNAME,
  PASS: process.env.PG_PASSWORD,
  DB: process.env.PG_DATABASE,
  DIALECT: "postgres", // according to sequelize docs (for pg db)
};

// Nodemailer
export const NODEMAILER = {
  SERVICE: "gmail",
  EMAIL: process.env.GOOGLE_EMAIL,
  PASSWORD: process.env.GOOGLE_PASSWORD,
};

// Admin Credentials
export const ADMIN = {
  USERNAME: process.env.ADMIN_USERNAME,
  PASSWORD: process.env.ADMIN_PASSWORD,
};

// Password
export const PASSWORD = {
  SECRET: process.env.PASSWORD_SECRET_SALT,
};

// Whatsapp
export const WHATSAPP = {
  APP_ID: process.env.W_APP_ID,
  APP_SECRET: process.env.W_APP_SECRET,
  RECIPIENT_WAID: process.env.W_RECIPIENT_WAID,
  VERSION: process.env.W_VERSION,
  PHONE_NUMBER_ID: process.env.W_PHONE_NUMBER_ID,
  ACCESS_TOKEN: process.env.W_ACCESS_TOKEN,
};

const env = {
  app: { ...APP, localUrl: APP_URL, publicUrl: BASE_URL },
  cache: REDIS,
  db: POSTGRESQL,
  nodemailer: NODEMAILER,
  admin: ADMIN,
  pass: PASSWORD,
  whatsapp: WHATSAPP,
};

export default env;
