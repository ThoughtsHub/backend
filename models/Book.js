import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

const Book = db.define("Book", {
  id: attr.id,
  title: {
    type: dt.STRING,
    allowNull: false,
  },
  author: {
    type: dt.ARRAY(dt.STRING),
    allowNull: false,
  },
  isbn10: {
    type: dt.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [10, 10],
    },
  },
  isbn13: {
    type: dt.STRING,
    allowNull: true,
    unique: true,
    validate: {
      len: [13, 13],
    },
  },
  genre: {
    type: dt.STRING,
    allowNull: false,
  },
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
  pageCount: dt.INTEGER,
  summary: dt.TEXT,
  coverImage: dt.STRING,
  price: {
    type: dt.DECIMAL(10, 2),
    allowNull: false,
  },
  sectionPrice: dt.DECIMAL(10, 2),
  pagePrice: dt.DECIMAL(10, 2),
  stock: {
    type: dt.INTEGER,
  },
  rating: {
    type: dt.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  ratedBy: {
    type: dt.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  content: dt.STRING,
});

export default Book;
