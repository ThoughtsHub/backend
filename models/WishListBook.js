import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

export const WishListBook = db.define("WishListBook", {
  id: attr.id,
});

// export default WishListBooks;
