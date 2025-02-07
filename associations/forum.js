import Forum from "../models/Forum.js";
import Profile from "../models/Profile.js";
import Vote from "../models/Vote.js";

const forumAssociations = () => {
  // a forum can have many votes
  Forum.hasMany(Vote, { foreignKey: "forumId", onDelete: "CASCADE" });
  Vote.belongsTo(Forum, { foreignKey: "forumId" });

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
