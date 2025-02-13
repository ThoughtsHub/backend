import ForumComment from "../models/Comment.js";
import ForumVote from "../models/Forum/Vote.js";
import Profile from "../models/Profile.js";
import School from "../models/School.js";

const F_KEY = "profileId";

const profileAssociation = () => {
  Profile.hasMany(School, { foreignKey: F_KEY, onDelete: "CASCADE" });
  School.belongsTo(Profile, { foreignKey: F_KEY });

  Profile.hasMany(ForumVote, { foreignKey: F_KEY, onDelete: "SET NULL" });
  ForumVote.belongsTo(Profile, { foreignKey: F_KEY });

  Profile.hasMany(ForumComment, { foreignKey: F_KEY, onDelete: "SET NULL" });
  ForumComment.belongsTo(Profile, { foreignKey: F_KEY });
};

export default profileAssociation;
