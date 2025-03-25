import { onDelete } from "../constants/hooks.js";
import Profile from "../models/Profile.js";
import ProfileCollege from "../models/ProfileCollege.js";

export const profileKey = "profileId";

const profileAssociations = () => {
  Profile.hasMany(ProfileCollege, {
    foreignKey: profileKey,
    onDelete: onDelete.cascade,
  });
  ProfileCollege.belongsTo(Profile, { foreignKey: profileKey });
};

export default profileAssociations;
