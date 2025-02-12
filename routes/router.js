// import all your routes here than put them in _routes

import { BookRouter } from "./book.js";
import { ForumsRouter } from "./forum.js";
import { LoginRouter } from "./login.js";
import { LogoutRouter } from "./logout.js";
import { NewsRouter } from "./news.js";
import { ProfileRouter } from "./profile.js";
import { SchoolRouter } from "./school.js";
import { UploadRouter } from "./upload.js";

const _routes = {
  login: LoginRouter,
  logout: LogoutRouter,
  uploads: UploadRouter,
  profile: ProfileRouter,
  news: NewsRouter,
  forums: ForumsRouter,
  books: BookRouter,
  school: SchoolRouter
};

export default _routes;
