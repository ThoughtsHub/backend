import db from "../db/pg.js";
import Report from "../models/Report.js";
import forumAssociations from "./forums.js";
import profileAssociations from "./profile.js";
import storyAssociations from "./story.js";
import userAssociations from "./user.js";

const initAssociations = async () => {
  userAssociations();
  profileAssociations();
  forumAssociations();
  storyAssociations();
  
  await Report.sync();

  await db.sync({ alter: true });
};

export default initAssociations;
