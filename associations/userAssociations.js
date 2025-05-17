import Profile from "../models/Profile.js";
import User from "../models/User.js";

export const userAssociation = () => {
  User.hasOne(Profile, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    as: "profile",
  });
  Profile.belongsTo(User, { foreignKey: "userId", as: "user" });
};
