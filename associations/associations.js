import db from "../db/pg.js";
import Report from "../models/Report.js";
import forumAssociations from "./forums.js";
import profileAssociations from "./profile.js";
import userAssociations from "./user.js";

const initAssociations = async () => {
  userAssociations();
  profileAssociations();
  forumAssociations();
  
  await Report.sync();

  await db.sync({ alter: true });
};

export default initAssociations;
