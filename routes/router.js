import { Router } from "express";
import auth from "../middlewares/auth.js";
import { LoginRouter } from "./login.js";
import { LogoutRouter } from "./logout.js";
import { OtpRouter } from "./otp.js";
import { ProfileRouter } from "./profile.js";
import { SchoolRouter } from "./school.js";
import { NewsRouter } from "./news.js";
import { SignupRouter } from "./signup.js";
import { TestRouter } from "./extras_testing.js";
import { ForumsRouter } from "./forums.js";
import upgradeRequest from "../middlewares/body.js";
import { RootRouter } from "./root.js";

const app = Router();

app.use(auth.verify);

// upgrade body/query of the request
app.use(upgradeRequest);

app.use("/", RootRouter);
app.use("/signup", SignupRouter);
app.use("/login", LoginRouter);
app.use("/logout", auth.login, LogoutRouter);
app.use("/otp", OtpRouter);
app.use("/profile", ProfileRouter);
app.use("/school", SchoolRouter);
app.use("/news", NewsRouter);
app.use("/forums", ForumsRouter);

// for testing purposes
app.use("/", TestRouter);

export const appRouter = app;
