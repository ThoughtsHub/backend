import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";

// export const _lists = ["saved", "news", "forums"];

// const SavedList = db.define("SavedList", {
//   id: attr.id,
//   name: {
//     type: dt.STRING,
//     allowNull: false,
//     defaultValue: _lists[0],
//   },
// });

// currently only news can be saved
export const SavedListNews = db.define("SavedListNews", {});

export const SavedListJobs = db.define("SavedListJobs", {});

export const SavedListBooks = db.define(
  "SavedListBooks",
  {},
  { indexes: [{ type: "UNIQUE", fields: ["profileId", "bookId"] }] }
);

// export default SavedList;
