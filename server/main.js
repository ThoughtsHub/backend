import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import env from "../constants/env.js";
import { appRouter } from "../routes/router.js";
import "../utils/response.js";

const app = express();

// application can use cookies
app.use(express.json()); // for raw json body to be parsed
app.use(cookieParser()); // for cookies
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
); // many middleware functions

// public folder
app.use(express.static(env.app.PUBLIC));

// reduce fingerprinting
app.disable("x-powered-by");

app.use("/", appRouter); // routes

export default app;
