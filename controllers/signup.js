import { client } from "../db/clients.js";
import auth from "../middlewares/auth.js";
import User from "../models/user.js";

const EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASS_FIELDS = ["password", "confirmationId"];

/**
 * creates a new user with the sent unique source and the desired password
 * @param {Request} req
 * @param {Response} res
 */
const createPassword = async (req, res) => {
  const body = req.body;
  body.setFields(PASS_FIELDS);

  if (body.anyFieldNull("password confirmationId")) return res.noParams();

  const [password, confirmationId] = body.bulkGet("password confirmationId");
  if (!body.isString("password")) return res.bad("Invalid type of password");

  try {
    // check confirmationId for the creating password
    const key = await client.get(confirmationId);
    if (key === null) return res.bad("Invalid confirmation Id");

    // check if email or mobile
    const isEmail = EMAIL_REGEXP.test(key);
    const updateWith = isEmail ? { email: key } : { mobile: key };

    // TODO: Check the password requirements

    const user = await User.create({ ...updateWith, password });

    const userToken = await auth.setup(user.id, res, key);

    res.ok("User created and logged In", { userToken });

    client.del(confirmationId); // delete the used confirmationId
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

export const SignupController = { createPassword };
