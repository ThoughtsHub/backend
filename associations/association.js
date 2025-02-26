import { db } from "../db/clients.js";
import commentAssociation from "./comment.js";
import companyAssociation from "./company.js";
import forumAssociation from "./forum.js";
import poemPostAssociation from "./poemPost.js";
import profileAssociation from "./profile.js";
import savedAssociation from "./saved.js";
import userAssociation from "./user.js";

const initAssociation = () => {
  userAssociation();
  profileAssociation();
  forumAssociation();
  commentAssociation();
  poemPostAssociation();
  companyAssociation();
  savedAssociation();

  db.sync({ force: true });
};

export default initAssociation;
