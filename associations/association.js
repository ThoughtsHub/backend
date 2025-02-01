// do the association of sql tables here
// in this directory

import { db } from "../db/connect.js";

const initAssociation = () => {
  // put association here

  db.sync({ alter: true }); // after linking, sync
};

export default initAssociation;
