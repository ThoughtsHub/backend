import bcryptjs from "bcryptjs";
import { PASSWORD } from "../constants/env.js";

const comparePassword = (password, hashed) => {
  const _password = PASSWORD.SECRET + password;
  const result = bcryptjs.compareSync(_password, hashed);
  return result;
};

const password = {
  compare: comparePassword,
};

export default password;
