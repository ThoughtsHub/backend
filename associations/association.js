import { db } from "../db/connect.js";
import commentAssociations from "./comment.js";
import educationAssociations from "./education.js";
import forumAssociations from "./forum.js";
import profileAssociations from "./profile.js";
import uploadAssociations from "./upload.js";
import userAssociations from "./user.js";
import voteAssociations from "./vote.js";

const initAssociation = () => {
  userAssociations();
  uploadAssociations();
  profileAssociations();
  educationAssociations();
  forumAssociations();
  voteAssociations();
  commentAssociations();

  db.sync({ alter: true }); // after linking, sync
};

export default initAssociation;
