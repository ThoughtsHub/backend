import Comment from "../models/Comment.js";
import Forum from "../models/Forum/Forum.js";
import Vote from "../models/Forum/Vote.js";

const F_KEY = "forumId";

const forumAssociation = () => {
  Forum.hasMany(Comment, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Comment.belongsTo(Forum, { foreignKey: F_KEY });

  Forum.hasMany(Vote, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Vote.belongsTo(Forum, { foreignKey: F_KEY });
};

export default forumAssociation;
