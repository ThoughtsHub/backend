import { onDelete } from "../constants/hooks.js";
import writer from "../constants/writer.js";
import Feedback from "../models/Feedback.js";
import Forum from "../models/Forums.js";
import Profile from "../models/Profile.js";
import Report from "../models/Report.js";

export const profileKey = "profileId";

const profileAssociations = () => {
  Profile.hasMany(Forum, {
    foreignKey: profileKey,
    onDelete: onDelete.cascade,
    as: "forum",
  });
  Forum.belongsTo(Profile, { foreignKey: profileKey, as: writer });

  Profile.hasMany(Feedback, {
    foreignKey: profileKey,
    onDelete: onDelete.cascade,
    as: "feedback",
  });
  Feedback.belongsTo(Profile, { foreignKey: profileKey, as: writer });

  Profile.hasMany(Report, {
    foreignKey: profileKey,
    onDelete: onDelete.cascade,
    as: "report",
  });
  Report.belongsTo(Profile, { foreignKey: profileKey, as: writer });
};

export default profileAssociations;
