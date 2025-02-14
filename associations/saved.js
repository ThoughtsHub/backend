import Book from "../models/Book.js";
import News from "../models/News.js";
import PrivateJob from "../models/PrivateJob.js";
import Profile from "../models/Profile.js";
import Saved from "../models/Saved.js";
import { F_KEY as PROFILE_KEY } from "./profile.js";

const BOOKS_KEY = "bookId";
const NEWS_KEY = "newsId";
const PRIVATEJOB_KEY = "privateJobId";

const savedAssociation = () => {
  Profile.belongsToMany(Book, {
    through: Saved.Books,
    foreignKey: PROFILE_KEY,
    otherKey: BOOKS_KEY,
    onDelete: "CASCADE",
  });
  Book.belongsToMany(Profile, {
    through: Saved.Books,
    foreignKey: BOOKS_KEY,
    otherKey: PROFILE_KEY,
    onDelete: "CASCADE",
  });

  Profile.belongsToMany(News, {
    through: Saved.News,
    foreignKey: PROFILE_KEY,
    otherKey: NEWS_KEY,
    onDelete: "CASCADE",
  });
  News.belongsToMany(Profile, {
    through: Saved.News,
    foreignKey: NEWS_KEY,
    otherKey: PROFILE_KEY,
    onDelete: "CASCADE",
  });

  Profile.belongsToMany(PrivateJob, {
    through: Saved.PrivateJobs,
    foreignKey: PROFILE_KEY,
    otherKey: PRIVATEJOB_KEY,
    onDelete: "CASCADE",
  });
  PrivateJob.belongsToMany(Profile, {
    through: Saved.PrivateJobs,
    foreignKey: PRIVATEJOB_KEY,
    otherKey: PROFILE_KEY,
    onDelete: "CASCADE",
  });
};

export default savedAssociation;
