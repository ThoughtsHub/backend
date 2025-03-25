import { onDelete } from "../constants/hooks.js";
import Forum from "../models/Forums.js";
import Profile from "../models/Profile.js";
import ProfileCollege from "../models/ProfileCollege.js";

export const profileKey = "profileId";

const profileAssociations = () => {
  Profile.hasMany(ProfileCollege, {
    foreignKey: profileKey,
    onDelete: onDelete.cascade,
    as: "college",
  });
  ProfileCollege.belongsTo(Profile, { foreignKey: profileKey, as: "college" });

  Profile.hasMany(Forum, {
    foreignKey: profileKey,
    onDelete: onDelete.setNull,
    as: "forum",
  });
  Forum.belongsTo(Profile, { foreignKey: profileKey, as: "forum" });
};

export default profileAssociations;
