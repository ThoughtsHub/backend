import Forum from "../models/Forum.js";
import Profile from "../models/Profile.js";

const forumAssociations = () => {
  // update forums count when creating/deleting forums
  Forum.afterCreate(async (payload, options) => {
    await Profile.increment("forums", {
      by: 1,
      where: { id: payload.profileId },
      transaction: options.transaction,
    });
  });

  Forum.beforeDestroy(async (payload, options) => {
    await Profile.decrement("forums", {
      by: 1,
      where: { id: payload.profileId },
      transaction: options.transaction,
    });
  });
};

export default forumAssociations;
