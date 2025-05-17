import Forum from "../models/Forum.js";
import ForumAppreciation from "../models/Forum_Appreciation.js";
import ForumComment from "../models/Forum_Comment.js";
import ReportForum from "../models/Report_Forum.js";

export const forumAssociation = () => {
  Forum.hasMany(ForumAppreciation, {
    foreignKey: "forumId",
    onDelete: "CASCADE",
    as: "appreciations_",
  });
  ForumAppreciation.belongsTo(Forum, { foreignKey: "forumId", as: "forum" });

  Forum.hasMany(ForumComment, {
    foreignKey: "forumId",
    onDelete: "CASCADE",
    as: "comments_",
  });
  ForumComment.belongsTo(Forum, { foreignKey: "forumId", as: "forum" });

  Forum.hasMany(ReportForum, {
    foreignKey: "forumId",
    onDelete: "CASCADE",
    as: "forumReports",
  });
  ReportForum.belongsTo(Forum, { foreignKey: "forumId", as: "forum" });
};
