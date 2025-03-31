import db from "../db/pg.js";
import forumAssociations from "./forums.js";
import profileAssociations from "./profile.js";
import storyAssociations from "./story.js";
import userAssociations from "./user.js";

const initAssociations = async () => {
  userAssociations();
  profileAssociations();
  forumAssociations();
  storyAssociations();

  db.sync({ force: true });
};

export default initAssociations;
