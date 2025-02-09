import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import auth from "../middlewares/auth.js";
import r from "../routes/router.js";
import _env from "../constants/env.js";
import "../utils/response.js";

const app = express();

app.use(express.json()); // body parser
app.use(cookieParser()); // cookie parser
app.use(helmet()); // many middleware functions

// login should not be with verification
app.use("/login", r.login);
app.use("/email", r.email); // email verification

app.use(auth.verify); // session verification middleware

// public folder
app.use(express.static(_env.app.PUBLIC));

// reduce fingerprinting
app.disable("x-powered-by");

// routes
app.get("/test", (req, res) => {
  res.json(req.user);
});

app.use("/forums", r.forums); // forums
app.use("/news", r.news); // news
app.use("/profile", r.profile); // profile
app.use("/uploads", r.uploads); // user uploads
app.use("/logout", r.logout);

app.all("*", (_, res) => {
  res.sendStatus(404); // Not found
});

export const _app = app;
