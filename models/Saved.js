import { DataTypes as dt } from "sequelize";
import { db } from "../db/clients.js";

// Saved Lists

export const SavedListNews = db.define("SavedListNews", {});

export const SavedListPrivateJobs = db.define("SavedListPrivateJobs", {});

export const SavedListBooks = db.define("SavedListBooks", {});

const Saved = {
  News: SavedListNews,
  PrivateJobs: SavedListPrivateJobs,
  Books: SavedListBooks,
};

export default Saved;
