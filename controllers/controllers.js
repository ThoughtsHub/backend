import { ForumController } from "./forums.js";
import { LoginController } from "./login.js";
import { NewsController } from "./news.js";
import { OtpController } from "./otp.js";
import { ProfileController } from "./profile.js";
import { SchoolController } from "./school.js";
import { SignupController } from "./signup.js";

/**
 * Controllers
 */
const controller = {
  login: LoginController,
  signup: SignupController,
  otp: OtpController,
  school: SchoolController,
  profile: ProfileController,
  news: NewsController,
  forums: ForumController,
};

export default controller;
