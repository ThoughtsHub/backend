import { Router } from "express";
import User from "../models/User.js";
import { loggedIn, setupAuth } from "../middlewares/auth/auth.js";
import client from "../db/redis.js";

const router = Router();

router.post("/login", async (req, res) => {
  const body = req.body;

  if (body.allNuldefined("username email mobile"))
    return res.failure("Username/email/mobile, required, at least one");
  if (body.isNuldefined("password")) return res.failure("password is required");

  const givenField = body.getNotNuldefined("username email mobile");
  const [identifier, password] = body.bulkGet(`${givenField} password`);

  try {
    const user = await User.findOne({ where: { [givenField]: identifier } });
    if (user === null) return res.failure(`Bad ${givenField}`);
    if (user.password !== password) return res.unauth("Wrong password");

    const userToken = await setupAuth(user.id);
    res.ok("Log in successful", { auth_token: userToken, user });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

router.get("/logout", loggedIn, async (req, res) => {
  const userToken = req.userToken;

  try {
    await client.del(userToken);

    res.ok("Successfully logged out");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

router.post("/signup/create-password", async (req, res) => {
  const body = req.body;

  const otpTokenFromHeaders =
    req.headers["otpToken"] ?? body.get("otpToken", null) ?? null;
  body.set("otpToken", otpTokenFromHeaders);

  const notGivenFields = body.anyNuldefined("password otpToken", ",");
  if (notGivenFields.length !== 0)
    return res.failure(`Required: ${notGivenFields}`);

  const { password, otpToken } = body.bulkGetMap("password otpToken");

  try {
    const otpTokenValue = await client.get(otpToken);
    await client.del(otpToken);
    if (otpTokenValue === null) return res.failure("Bad otpToken");
    const [givenField, contact] = otpTokenValue.split(":");

    // TODO: check password requirements

    const user = await User.create({ [givenField]: contact, password });

    const userToken = await setupAuth(user.id);
    res.ok("Sign up successful", { auth_token: userToken, user });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const LoginRouter = router;
