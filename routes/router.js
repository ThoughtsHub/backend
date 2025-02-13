import { Router } from "express";
import { APP } from "../constants/env.js";

const app = Router();

app.use("/", (req, res) => {
  res.sendFile("index.html", {root: APP.PUBLIC});
});

export const appRouter = app;
