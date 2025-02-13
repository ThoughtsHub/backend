import { db } from "../db/clients.js";
import commentAssociation from "./comment.js";
import forumAssociation from "./forum.js";
import profileAssociation from "./profile.js";
import userAssociation from "./user.js";

const initAssociation = () => {
  userAssociation();
  profileAssociation();
  forumAssociation();
  commentAssociation();

  db.sync({ force: true });
};

export default initAssociation;
