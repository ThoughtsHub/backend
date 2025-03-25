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
    res.ok("Log in successful", { userToken });
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

  const notGivenFields = body.anyNuldefined("password userToken", ",");
  if (notGivenFields.length !== 0)
    return res.failure(`Required: ${notGivenFields}`);

  const { password, userToken: utoken } = body.bulkGetMap("password userToken");

  try {
    const userTokenValue = await client.get(utoken);
    if (userTokenValue === null) return res.failure("Bad userToken");
    const [givenField, contact] = userTokenValue.split(":");

    // TODO: check password requirements

    const user = await User.create({ [givenField]: contact, password });

    const userToken = await setupAuth(user.id);
    res.created("Sign up successful", { userToken });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const LoginRouter = router;
