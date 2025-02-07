import Creativity from "../models/Creativity.js";
import Like from "../models/Like.js";

const likeAssociations = () => {
  // when like, creativity's like increases
  Like.afterCreate(async (payload, options) => {
    await Creativity.increment("likes", {
      by: 1,
      where: { id: payload.creativityId },
      transaction: options.transaction,
    });
  });

  Like.afterDestroy(async (payload, options) => {
    await Creativity.decrement("likes", {
      by: 1,
      where: { id: payload.creativityId },
      transaction: options.transaction,
    });
  });
};

export default likeAssociations;
