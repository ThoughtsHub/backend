// import all your routes here than put them in _routes

import { LoginRouter } from "./login.js";
import { LogoutRouter } from "./logout.js";

const _routes = {
  login: LoginRouter,
  logout: LogoutRouter,
};

export default _routes;
