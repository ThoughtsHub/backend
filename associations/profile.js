import Comment from "../models/Comment.js";
import Vote from "../models/Vote.js";
import Like from "../models/Like.js";
import PoemPost from "../models/PoemPost.js";
import Profile from "../models/Profile.js";
import School from "../models/School.js";

export const F_KEY = "profileId";

const profileAssociation = () => {
  Profile.hasMany(School, { foreignKey: F_KEY, onDelete: "CASCADE" });
  School.belongsTo(Profile, { foreignKey: F_KEY });

  Profile.hasMany(Vote, { foreignKey: F_KEY, onDelete: "SET NULL" });
  Vote.belongsTo(Profile, { foreignKey: F_KEY });

  Profile.hasMany(Comment, { foreignKey: F_KEY, onDelete: "SET NULL" });
  Comment.belongsTo(Profile, { foreignKey: F_KEY });

  Profile.hasMany(Like, { foreignKey: F_KEY, onDelete: "SET NULL" });
  Like.belongsTo(Profile, { foreignKey: F_KEY });

  Profile.hasMany(PoemPost, { foreignKey: F_KEY, onDelete: "CASCADE" });
  PoemPost.belongsTo(Profile, { foreignKey: F_KEY });
};

export default profileAssociation;
