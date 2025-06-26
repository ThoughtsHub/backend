import db from "../db/pg.js";
import { forumAssociation } from "./forumAssociations.js";
import { NewsAssociation } from "./newsAssociations.js";
import { profileAssociation } from "./profileAssociations.js";
import { userAssociation } from "./userAssociations.js";
import { wordleAssociations } from "./wordleAssociations.js";
import { instituteAssociations } from "./instituteAssociations.js";
import { profileEducationAssociations } from "./profileEduAssociations.js";
import Activity from "../models/Activity.js";
import Log from "../models/Log.js";
import ProfileEducation from "../models/ProfileEducation.js";

export const initLink = async () => {
  userAssociation();
  profileAssociation();
  forumAssociation();
  NewsAssociation();
  wordleAssociations();
  instituteAssociations();
  profileEducationAssociations();

  await db.sync({ alter: true });
};
