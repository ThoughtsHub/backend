import Comment from "../models/Comment.js";
import Forum from "../models/Forum.js";

const commentAssociations = () => {
  // update comments
  Comment.afterCreate(async (payload, options) => {
    await Forum.increment("comments", {
      by: 1,
      where: { id: payload.forumId },
      transaction: options.transaction,
    });
  });

  Comment.afterDestroy(async (payload, options) => {
    await Forum.decrement("comments", {
      by: 1,
      where: { id: payload.forumId },
      transaction: options.transaction,
    });
  });
};

export default commentAssociations;
