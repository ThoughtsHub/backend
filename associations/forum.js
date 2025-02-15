import Comment from "../models/Comment.js";
import Forum from "../models/Forum.js";
import Profile from "../models/Profile.js";
import Vote from "../models/Vote.js";
import dbUnary from "../utils/db.js";

const F_KEY = "forumId";

const forumAssociation = () => {
  Forum.hasMany(Comment, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Comment.belongsTo(Forum, { foreignKey: F_KEY });

  Forum.hasMany(Vote, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Vote.belongsTo(Forum, { foreignKey: F_KEY });

  Forum.afterCreate(async (payload, options) => {
    const t = options.transaction;
    await dbUnary.increment1(Profile, "forums", payload.forumId, t);
  });
  Forum.afterDestroy(async (payload, options) => {
    const t = options.transaction;
    await dbUnary.decrement1(Profile, "forums", payload.forumId, t);
  });
};

export default forumAssociation;
