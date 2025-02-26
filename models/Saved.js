import { DataTypes as dt } from "sequelize";
import { db } from "../db/clients.js";
import baseModel from "./BaseModel.js";

// Saved Lists

export const SavedListNews = db.define(
  "SavedListNews",
  { ...baseModel.config },
  { ...baseModel.options }
);

export const SavedListPrivateJobs = db.define(
  "SavedListPrivateJobs",
  { ...baseModel.config },
  { ...baseModel.options }
);

export const SavedListBooks = db.define(
  "SavedListBooks",
  { ...baseModel.config },
  { ...baseModel.options }
);

const Saved = {
  News: SavedListNews,
  PrivateJobs: SavedListPrivateJobs,
  Books: SavedListBooks,
};

export default Saved;
