import PrivateJob from "../models/Job.js";
import News from "../models/News.js";
import Profile from "../models/Profile.js";
import { SavedListJobs, SavedListNews } from "../models/SavedList.js";
// import SavedList from "../models/SavedList.js";

const savedListAssociations = () => {
  // news saved
  Profile.belongsToMany(News, {
    through: SavedListNews,
    foreignKey: "profileId",
    otherKey: "newsId",
  });
  News.belongsToMany(Profile, {
    through: SavedListNews,
    foreignKey: "newsId",
    otherKey: "profileId",
  });

  // jobs saved
  Profile.belongsToMany(PrivateJob, {
    through: SavedListJobs,
    foreignKey: "profileId",
    otherKey: "jobId",
  });
  PrivateJob.belongsToMany(Profile, {
    through: SavedListJobs,
    foreignKey: "jobId",
    otherKey: "profileId",
  });
};

export default savedListAssociations;
