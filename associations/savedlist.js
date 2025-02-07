import News from "../models/News.js";
import Profile from "../models/Profile.js";
import { SavedListNews } from "../models/SavedList.js";
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
};

export default savedListAssociations;
