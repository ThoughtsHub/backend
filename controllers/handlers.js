import BookHandler from "./book.js";
import EducationHandler from "./education.js";
import EmailHandler from "./email.js";
import ForumsHandler from "./forum.js";
import LoginHandler from "./login.js";
import LogoutHandler from "./logout.js";
import NewsHandler from "./news.js";
import ProfileHandler from "./profile.js";
import UploadHandler from "./upload.js";

const handlers = {
  login: LoginHandler,
  logout: LogoutHandler,
  news: NewsHandler,
  profile: ProfileHandler,
  uploads: UploadHandler,
  forums: ForumsHandler,
  email: EmailHandler,
  education: EducationHandler,
  book: BookHandler
};

export default handlers;
