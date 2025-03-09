import { client } from "../db/clients.js";
import auth from "../middlewares/auth.js";
import User from "../models/user.js";

const EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASS_FIELDS = ["password", "otpToken"];

/**
 * creates a new user with the sent unique source and the desired password
 * @param {Request} req
 * @param {Response} res
 */
const createPassword = async (req, res) => {
  const body = req.body;
  body.setFields(PASS_FIELDS);

  const otpToken = req.headers['otptoken']
  body.set("otpToken", otpToken);

  if (body.anyFieldNull("password otpToken")) return res.noParams("password otpToken");

  const password = body.get("password");
  if (!body.isString("password")) return res.bad("Invalid type of password");

  try {
    // check otpToken for the creating password
    const key = await client.get(otpToken);
    if (key === null) return res.bad("Invalid otp token");

    // check if email or mobile
    const isEmail = EMAIL_REGEXP.test(key);
    const updateWith = isEmail ? { email: key } : { mobile: key };

    // TODO: Check the password requirements

    const user = await User.create({ ...updateWith, password });

    const userToken = await auth.setup(user.id, res, key);

    res.ok("User created and logged In", { userToken });

    client.del(otpToken); // delete the used otpToken
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

export const SignupController = { createPassword };
