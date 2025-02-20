import { LoginController } from "./login.js";
import { OtpController } from "./otp.js";
import { SignupController } from "./signup.js";

/**
 * Controllers
 */
const controller = {
  login: LoginController,
  signup: SignupController,
  otp: OtpController,
};

export default controller;
