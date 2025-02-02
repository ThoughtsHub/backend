// import all your routes here than put them in _routes

import { LoginRouter } from "./login.js";
import { LogoutRouter } from "./logout.js";
import { UploadRouter } from "./upload.js";

const _routes = {
  login: LoginRouter,
  logout: LogoutRouter,
  uploads: UploadRouter
};

export default _routes;
