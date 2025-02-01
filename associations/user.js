import User from "../models/User.js";
import Profile from "../models/Profile.js";

const userAssociations = () => {
  // User have one profile
  User.hasOne(Profile, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    as: "data",
  });
  Profile.belongsTo(User, { foreignKey: "userId" });
};

export default userAssociations;
