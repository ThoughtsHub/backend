import { Router } from "express";
import { spawn } from "child_process";
import { APP } from "../constants/env.js";
import auth from "../middlewares/auth.js";
import { LoginRouter } from "./login.js";
import { LogoutRouter } from "./logout.js";
import { OtpRouter } from "./otp.js";
import { ProfileRouter } from "./profile.js";
import { SchoolRouter } from "./school.js";
import { NewsRouter } from "./news.js";
import { SignupRouter } from "./signup.js";

// Path to your shell script
const reloadScriptPath = "./scripts/reload.sh";

const app = Router();

app.use(auth.verify);

app.use("/signup", SignupRouter);
app.use("/login", LoginRouter);
app.use("/logout", auth.login, LogoutRouter);
app.use("/otp", OtpRouter);
app.use("/profile", ProfileRouter);
app.use("/school", SchoolRouter);
app.use("/news", NewsRouter);

app.get("/test", auth.login, (req, res) => {
  res.json({ user: req.user });
});

app.get("/reload-website", async (_, res) => {
  const child = spawn("bash", [reloadScriptPath], {
    detached: true,
    stdio: "ignore",
  });

  // detach process
  child.unref();

  res.send("Restarting....");
  process.exit(0);
});

export const appRouter = app;
