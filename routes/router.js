import { Router } from "express";
import { APP } from "../constants/env.js";
import auth from "../middlewares/auth.js";
import { LoginRouter } from "./login.js";
import { LogoutRouter } from "./logout.js";
import { OtpRouter } from "./otp.js";
import { ProfileRouter } from "./profile.js";
import { SchoolRouter } from "./school.js";
import { NewsRouter } from "./news.js";

const app = Router();

app.use(auth.verify);

app.use("/login", LoginRouter);
app.use("/logout", auth.login, LogoutRouter);
app.use("/", OtpRouter);
app.use("/profile", ProfileRouter);
app.use("/school", SchoolRouter);
app.use("/news", NewsRouter);

app.get("/test", auth.login, (req, res) => {
  console.log(req.user);
  res.sendFile("index.html", { root: APP.PUBLIC });
});

export const appRouter = app;
