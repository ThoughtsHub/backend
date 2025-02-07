import { db } from "../db/connect.js";
import educationAssociations from "./education.js";
import forumAssociations from "./forum.js";
import profileAssociations from "./profile.js";
import uploadAssociations from "./upload.js";
import userAssociations from "./user.js";

const initAssociation = () => {
  userAssociations();
  uploadAssociations();
  profileAssociations();
  educationAssociations();
  forumAssociations();

  db.sync({ alter: true }); // after linking, sync
};

export default initAssociation;
