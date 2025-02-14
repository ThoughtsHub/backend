import { Router } from "express";
import { APP } from "../constants/env.js";
import auth from "../middlewares/auth.js";

const app = Router();

app.get("/test", auth.verify, auth.login, (req, res) => {
  console.log(req.user);
  res.sendFile("index.html", { root: APP.PUBLIC });
});

export const appRouter = app;
