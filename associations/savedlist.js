import Book from "../models/Book.js";
import PrivateJob from "../models/Job.js";
import News from "../models/News.js";
import Profile from "../models/Profile.js";
import {
  SavedListBooks,
  SavedListJobs,
  SavedListNews,
} from "../models/SavedList.js";
// import SavedList from "../models/SavedList.js";

const savedListAssociations = () => {
  // news saved
  Profile.belongsToMany(News, {
    through: SavedListNews,
    foreignKey: "profileId",
    otherKey: "newsId",
    onDelete: "SET NULL",
  });
  News.belongsToMany(Profile, {
    through: SavedListNews,
    foreignKey: "newsId",
    otherKey: "profileId",
    onDelete: "SET NULL",
  });

  // jobs saved
  Profile.belongsToMany(PrivateJob, {
    through: SavedListJobs,
    foreignKey: "profileId",
    otherKey: "jobId",
    onDelete: "SET NULL",
  });
  PrivateJob.belongsToMany(Profile, {
    through: SavedListJobs,
    foreignKey: "jobId",
    otherKey: "profileId",
    onDelete: "SET NULL",
  });

  // books
  Profile.belongsToMany(Book, {
    through: SavedListBooks,
    foreignKey: "profileId",
    otherKey: "bookId",
    onDelete: "SET NULL",
  });
  Book.belongsToMany(Profile, {
    through: SavedListBooks,
    foreignKey: "bookId",
    otherKey: "profileId",
    onDelete: "SET NULL",
  });
};

export default savedListAssociations;
