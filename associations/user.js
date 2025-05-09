import { onDelete } from "../constants/hooks.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";

export const userKey = "userId";

const userAssociations = () => {
  User.hasOne(Profile, { foreignKey: userKey, onDelete: onDelete.cascade });
  Profile.belongsTo(User, { foreignKey: userKey, onDelete: onDelete.cascade });
};

export default userAssociations;
