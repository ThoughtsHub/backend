import Feedback from "../models/Feedback.js";
import Follower from "../models/Follower.js";
import Forum from "../models/Forum.js";
import ForumAppreciation from "../models/Forum_Appreciation.js";
import ForumComment from "../models/Forum_Comment.js";
import Profile from "../models/Profile.js";
import ReportForum from "../models/Report_Forum.js";

export const profileAssociation = () => {
  Profile.hasMany(Forum, {
    foreignKey: "profileId",
    onDelete: "CASCADE",
    as: "forums_",
  });
  Forum.belongsTo(Profile, { foreignKey: "profileId", as: "writer" });

  Profile.hasMany(ForumComment, {
    foreignKey: "profileId",
    onDelete: "CASCADE",
    as: "comments",
  });
  ForumComment.belongsTo(Profile, { foreignKey: "profileId", as: "writer" });

  Profile.hasMany(ForumAppreciation, {
    foreignKey: "profileId",
    onDelete: "CASCADE",
    as: "appreciations",
  });
  ForumAppreciation.belongsTo(Profile, {
    foreignKey: "profileId",
    as: "profile",
  });

  Profile.hasMany(Feedback, {
    foreignKey: "profileId",
    onDelete: "SET NULL",
    as: "feedbacks",
  });
  Feedback.belongsTo(Profile, { foreignKey: "profileId", as: "writer" });

  Profile.hasMany(ReportForum, {
    foreignKey: "profileId",
    onDelete: "CASCADE",
    as: "forumReports",
  });
  ReportForum.belongsTo(Profile, { foreignKey: "profileId", as: "reporter" });

  Profile.hasMany(Follower, { foreignKey: "profileId", onDelete: "CASCADE" });
  Follower.belongsTo(Profile, { foreignKey: "profileId" });

  Profile.hasMany(Follower, { foreignKey: "followerId", onDelete: "CASCADE" });
  Follower.belongsTo(Profile, { foreignKey: "followerId" });
};
