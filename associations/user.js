import Profile from "../models/Profile.js";
import User from "../models/user.js";

const F_KEY = "userId";

const userAssociation = () => {
  User.hasOne(Profile, { foreignKey: F_KEY, onDelete: "CASCADE" });
  Profile.belongsTo(User, { foreignKey: F_KEY });
};

export default userAssociation;
