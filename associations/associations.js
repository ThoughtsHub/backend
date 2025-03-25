import db from "../db/pg.js";
import userAssociations from "./user.js";

const initAssociations = async () => {
  userAssociations();

  db.sync({ force: true });
};

export default initAssociations;
