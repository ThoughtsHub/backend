import Comment from "../models/Comment.js";
import Forum from "../models/Forum.js";
import Like from "../models/Like.js";
import Post from "../models/Post.js";
import dbUnary from "../utils/db.js";

const F_KEY = "commentId";

const commentAssociation = () => {
  Comment.hasMany(Comment, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Comment.belongsTo(Comment, { foreignKey: F_KEY });

  Comment.hasMany(Like, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Like.belongsTo(Comment, { foreignKey: F_KEY });

  Comment.afterCreate(async (payload, options) => {
    const t = options.transaction;

    const postId = payload.postId;
    const forumId = payload.forumId;

    if (forumId !== null)
      await dbUnary.increment1(Forum, "comments", forumId, t);
    else if (postId !== null)
      await dbUnary.increment1(Post, "comments", postId, t);
  });

  Comment.afterDestroy(async (payload, options) => {
    const t = options.transaction;

    const postId = payload.postId;
    const forumId = payload.forumId;

    if (forumId !== null)
      await dbUnary.decrement1(Forum, "comments", forumId, t);
    else if (postId !== null)
      await dbUnary.decrement1(Post, "comments", postId, t);
  });
};

export default commentAssociation;
