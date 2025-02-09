import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Upload from "../models/Upload.js";
import Email from "../models/Email.js";
import handle from "../utils/handle.js";

const userAssociations = () => {
  // user will have a email
  User.hasMany(Email, {
    foreignKey: "userId",
    as: "userEmails",
    onDelete: "CASCADE",
  });
  Email.belongsTo(User, { foreignKey: "userId" });

  // User have one profile
  User.hasOne(Profile, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    as: "data",
  });
  Profile.belongsTo(User, { foreignKey: "userId" });

  // user can have many uploads
  User.hasMany(Upload, {
    foreignKey: "userId",
    onDelete: "SET NULL",
  });
  Upload.belongsTo(User, { foreignKey: "userId" });

  // create a user profile on user creation
  User.afterCreate(async (payload, options) => {
    const _handle = handle.create(payload.username);
    await Profile.create(
      { firstName: payload.username, handle: _handle, userId: payload.id },
      { transaction: options.transaction }
    );
  });
};

export default userAssociations;
