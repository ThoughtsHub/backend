import { DataTypes as dt } from "sequelize";
import ATTR from "../constants/db.js";
import { db } from "../db/clients.js";

const Book = db.define("Book", {
  id: { ...ATTR.ID },
  title: { ...ATTR.STR_REQ },
  author: {
    type: dt.ARRAY(dt.STRING),
    allowNull: false,
  },
  isbn10: { ...ATTR.UNIQ_STR_REQ, validate: { len: [10, 10] } },
  isbn13: { ...ATTR.UNIQUE_STR, validate: { len: [13, 13] } },
  genre: { ...ATTR.STR_REQ },
  publicationYear: {
    type: dt.INTEGER,
    allowNull: false,
  },
  publisher: dt.STRING,
  language: {
    type: dt.STRING,
    allowNull: false,
    defaultValue: "English",
  },
  pageCount: { ...ATTR.INTEGER },
  summary: dt.TEXT,
  coverImage: dt.STRING,
  price: {
    type: dt.DECIMAL(10, 2),
    allowNull: false,
  },
  sectionPrice: dt.DECIMAL(10, 2),
  pagePrice: dt.DECIMAL(10, 2),
  stock: { ...ATTR.INTEGER },
  rating: {
    type: dt.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  ratedBy: { ...ATTR.INTEGER },
  content: dt.STRING,
  handle: { ...ATTR.UNIQ_STR_REQ },
});

export default Book;
