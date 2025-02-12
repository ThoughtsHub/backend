import bcryptjs from "bcryptjs";
import pass from "../constants/password.js";

const checkPassword = (password) => {
  // TODO: rules for password generation
  return true;
};

const comparePassword = (password, hashedPassword) => {
  const updatedPassword = pass.secret + password;
  const eq = bcryptjs.compareSync(updatedPassword, hashedPassword);
  return eq;
};

const _password = {
  checkPassword,
  comparePassword,
};

export default _password;
