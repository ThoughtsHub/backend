import { db } from "../db/connect.js";
import profileAssociations from "./profile.js";
import userAssociations from "./user.js";

const initAssociation = () => {
  userAssociations();
  profileAssociations();

  db.sync({ alter: true }); // after linking, sync
};

export default initAssociation;
