import { onDelete } from "../constants/hooks.js";
import writer from "../constants/writer.js";
import Forum from "../models/Forums.js";
import Profile from "../models/Profile.js";
import ProfileCollege from "../models/ProfileCollege.js";

export const profileKey = "profileId";

const profileAssociations = () => {
  Profile.hasMany(ProfileCollege, { foreignKey: profileKey, as: "college" });
  ProfileCollege.belongsTo(Profile, { foreignKey: profileKey, as: "college" });

  Profile.hasMany(Forum, {
    foreignKey: profileKey,
    onDelete: onDelete.cascade,
    as: "forum",
  });
  Forum.belongsTo(Profile, { foreignKey: profileKey, as: writer });
};

export default profileAssociations;
