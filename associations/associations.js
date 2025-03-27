import db from "../db/pg.js";
import forumAssociations from "./forums.js";
import profileAssociations from "./profile.js";
import userAssociations from "./user.js";

const initAssociations = async () => {
  userAssociations();
  profileAssociations();
  forumAssociations();

  db.sync({ alter: true });
};

export default initAssociations;
