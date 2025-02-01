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

  // create a user profile on user creation
  User.afterCreate(async (payload, options) => {
    await Profile.create(
      { firstName: payload.username, userId: payload.id },
      { transaction: options.transaction }
    );
  });
};

export default userAssociations;
