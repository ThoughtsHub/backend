import { db } from "../db/connect.js";
import commentAssociations from "./comment.js";
import companyAssociations from "./company.js";
import creativityAssociations from "./creativity.js";
import educationAssociations from "./education.js";
import forumAssociations from "./forum.js";
import jobAssociations from "./job.js";
import likeAssociations from "./like.js";
import profileAssociations from "./profile.js";
import savedListAssociations from "./savedlist.js";
import uploadAssociations from "./upload.js";
import userAssociations from "./user.js";
import voteAssociations from "./vote.js";
import wishListBooksAssociations from "./wishlistbooks.js";

const initAssociation = () => {
  userAssociations();
  uploadAssociations();
  profileAssociations();
  educationAssociations();
  forumAssociations();
  voteAssociations();
  commentAssociations();
  savedListAssociations();
  wishListBooksAssociations();
  creativityAssociations();
  likeAssociations();
  jobAssociations();
  companyAssociations();

  db.sync({ force: true }); // after linking, sync
};

export default initAssociation;
