// import all your routes here than put them in _routes

import { LoginRouter } from "./login.js";
import { LogoutRouter } from "./logout.js";
import { ProfileRouter } from "./profile.js";
import { UploadRouter } from "./upload.js";

const _routes = {
  login: LoginRouter,
  logout: LogoutRouter,
  uploads: UploadRouter,
  profile: ProfileRouter,
};

export default _routes;
