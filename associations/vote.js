import Forum from "../models/Forum.js";
import Vote from "../models/Vote.js";

const voteAssociations = () => {
  // update votes for forums
  Vote.afterCreate(async (payload, options) => {
    const forumId = payload.forumId;
    if (forumId) {
      if (payload.type === "upvote")
        await Forum.increment("upvotes", {
          by: 1,
          where: { id: forumId },
          transaction: options.transaction,
        });
      else if (payload.type === "downvote")
        await Forum.increment("downvotes", {
          by: 1,
          where: { id: forumId },
          transaction: options.transaction,
        });
    }
  });

  // on update, forums
  Vote.afterUpdate(async (payload, options) => {
    const forumId = payload.forumId;
    if (forumId) {
      const prevVote = payload.previous("type");
      const currentVote = payload.type;

      // decrement the prev vote
      if (prevVote === "upvote")
        await Forum.decrement("upvotes", {
          by: 1,
          where: { id: forumId },
          transaction: options.transaction,
        });
      else if (prevVote === "downvote")
        await Forum.decrement("downvotes", {
          by: 1,
          where: { id: forumId },
          transaction: options.transaction,
        });

      // increment the current vote
      if (currentVote === "upvote")
        await Forum.increment("upvotes", {
          by: 1,
          where: { id: forumId },
          transaction: options.transaction,
        });
      else if (currentVote === "downvote")
        await Forum.increment("downvotes", {
          by: 1,
          where: { id: forumId },
          transaction: options.transaction,
        });
    }
  });

  // on delete, forums
  Vote.beforeDestroy(async (payload, options) => {
    const forumId = payload.forumId;
    if (forumId) {
      const vote = payload.type;

      // decrement the prev vote
      if (vote === "upvote")
        await Forum.decrement("upvotes", {
          by: 1,
          where: { id: forumId },
          transaction: options.transaction,
        });
      else if (vote === "downvote")
        await Forum.decrement("downvotes", {
          by: 1,
          where: { id: forumId },
          transaction: options.transaction,
        });
    }
  });
};

export default voteAssociations;
