import Comment from "../models/Comment.js";
import Creativity from "../models/Creativity.js";
import Forum from "../models/Forum.js";

const commentAssociations = () => {
  // update comments
  Comment.afterCreate(async (payload, options) => {
    if (payload.forumId)
      await Forum.increment("comments", {
        by: 1,
        where: { id: payload.forumId },
        transaction: options.transaction,
      });
    if (payload.creativityId)
      await Creativity.increment("comments", {
        by: 1,
        where: { id: payload.creativityId },
        transaction: options.transaction,
      });
  });

  Comment.afterDestroy(async (payload, options) => {
    if (payload.forumId)
      await Forum.decrement("comments", {
        by: 1,
        where: { id: payload.forumId },
        transaction: options.transaction,
      });
    if (payload.creativityId)
      await Creativity.decrement("comments", {
        by: 1,
        where: { id: payload.creativityId },
        transaction: options.transaction,
      });
  });
};

export default commentAssociations;
