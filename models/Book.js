import { DataTypes as dt } from "sequelize";
import {
  ID,
  INTEGER,
  STR_REQ,
  UNIQ_STR_REQ,
  UNIQUE_STR,
} from "../constants/db.js";
import { db } from "../db/clients.js";

const Book = db.define("Book", {
  id: ID,
  title: STR_REQ,
  author: {
    type: dt.ARRAY(dt.STRING),
    allowNull: false,
  },
  isbn10: { ...UNIQ_STR_REQ, validate: { len: [10, 10] } },
  isbn13: { ...UNIQUE_STR, validate: { len: [13, 13] } },
  genre: STR_REQ,
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
  pageCount: INTEGER,
  summary: dt.TEXT,
  coverImage: dt.STRING,
  price: {
    type: dt.DECIMAL(10, 2),
    allowNull: false,
  },
  sectionPrice: dt.DECIMAL(10, 2),
  pagePrice: dt.DECIMAL(10, 2),
  stock: INTEGER,
  rating: {
    type: dt.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  ratedBy: INTEGER,
  content: dt.STRING,
  handle: UNIQ_STR_REQ,
});

export default Book;
