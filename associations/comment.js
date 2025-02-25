import Comment from "../models/Comment.js";
import Forum from "../models/Forum.js";
import Like from "../models/Like.js";
import PoemPost from "../models/PoemPost.js";
import dbUnary from "../utils/db.js";

const F_KEY = "commentId";

const commentAssociation = () => {
  Comment.hasMany(Comment, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Comment.belongsTo(Comment, { foreignKey: F_KEY });

  Comment.hasMany(Like, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Like.belongsTo(Comment, { foreignKey: F_KEY });

  Comment.afterCreate(async (payload, options) => {
    const t = options.transaction;

    const poemPostId = payload.poemPostId;
    const forumId = payload.forumId;

    if (forumId !== null)
      await dbUnary.increment1(Forum, "comments", forumId, t);
    else if (poemPostId !== null)
      await dbUnary.increment1(Post, "comments", poemPostId, t);
  });

  Comment.afterDestroy(async (payload, options) => {
    const t = options.transaction;

    const poemPostId = payload.poemPostId;
    const forumId = payload.forumId;

    if (forumId !== null)
      await dbUnary.decrement1(Forum, "comments", forumId, t);
    else if (poemPostId !== null)
      await dbUnary.decrement1(Post, "comments", poemPostId, t);
  });
};

export default commentAssociation;
