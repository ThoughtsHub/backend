// import all your routes here than put them in _routes

import { BookRouter } from "./book.js";
import { EmailRouter } from "./email.js";
import { ForumsRouter } from "./forum.js";
import { LoginRouter } from "./login.js";
import { LogoutRouter } from "./logout.js";
import { NewsRouter } from "./news.js";
import { ProfileRouter } from "./profile.js";
import { UploadRouter } from "./upload.js";

const _routes = {
  login: LoginRouter,
  logout: LogoutRouter,
  uploads: UploadRouter,
  profile: ProfileRouter,
  email: EmailRouter,
  news: NewsRouter,
  forums: ForumsRouter,
  books: BookRouter,
};

export default _routes;
