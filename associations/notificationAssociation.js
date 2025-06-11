import Forum from "../models/Forum.js";
import ForumComment from "../models/Forum_Comment.js";
import Notification from "../models/Notification.js";
import Profile from "../models/Profile.js";

export const notificationAssociations = () => {
  Profile.hasMany(Notification, {
    foreignKey: "profileId",
    onDelete: "CASCADE",
  });
  Notification.belongsTo(Profile, { foreignKey: "profileId" });

  Profile.hasMany(Notification, {
    foreignKey: "fromProfileId",
    onDelete: "CASCADE",
  });
  Notification.belongsTo(Profile, { foreignKey: "fromProfileId" });

  Forum.hasMany(Notification, { foreignKey: "forumId", onDelete: "CASCADE" });
  Notification.belongsTo(Forum, { foreignKey: "forumId" });

  ForumComment.hasMany(Notification, {
    foreignKey: "commentId",
    onDelete: "CASCADE",
  });
  Notification.belongsTo(ForumComment, { foreignKey: "commentId" });
};
