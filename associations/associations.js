import db from "../db/pg.js";

const initAssociations = async () => {
  db.sync({ force: true });
};

export default initAssociations;
