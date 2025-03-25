import { onDelete } from "../constants/hooks.js";
import ForumComment from "../models/ForumComment.js";
import Forum from "../models/Forums.js";
import ForumVote from "../models/ForumVote.js";
import Profile from "../models/Profile.js";
import { profileKey } from "./profile.js";

export const forumKey = "forumId";

const forumAssociations = () => {
  Forum.hasMany(ForumVote, { foreignKey: forumKey });
  Profile.hasMany(ForumVote, { foreignKey: profileKey });
  ForumVote.belongsTo(Forum, { foreignKey: forumKey });
  ForumVote.belongsTo(Profile, { foreignKey: profileKey });

  Forum.hasMany(ForumComment, { foreignKey: forumKey });
  Profile.hasMany(ForumComment, { foreignKey: profileKey });
  ForumComment.belongsTo(Forum, { foreignKey: forumKey });
  ForumComment.belongsTo(Profile, { foreignKey: profileKey });
};

export default forumAssociations;
