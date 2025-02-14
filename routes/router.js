import { Router } from "express";
import { APP } from "../constants/env.js";
import auth from "../middlewares/auth.js";
import { LoginRouter } from "./login.js";

const app = Router();

app.use(auth.verify);

app.use("/login", LoginRouter);

app.get("/test", auth.login, (req, res) => {
  console.log(req.user);
  res.sendFile("index.html", { root: APP.PUBLIC });
});

export const appRouter = app;
