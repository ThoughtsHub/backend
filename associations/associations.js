import db from "../db/pg.js";
import profileAssociations from "./profile.js";
import userAssociations from "./user.js";

const initAssociations = async () => {
  userAssociations();
  profileAssociations();

  db.sync({ force: true });
};

export default initAssociations;
