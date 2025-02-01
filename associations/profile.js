import Profile from "../models/Profile.js";
import Interest from "../models/Interest.js";
import AccountLink from "../models/AccountLink.js";

const profileAssociations = () => {
  // a profile can have many interests
  // and a interest can be in many profiles
  Profile.belongsToMany(Interest, {
    through: "profileInterests",
    foreignKey: "profileId",
    otherKey: "interestId",
    onDelete: "SET NULL",
  });
  Interest.belongsToMany(Profile, {
    through: "profileInterests",
    foreignKey: "interestId",
    otherKey: "profileId",
    onDelete: "SET NULL",
  });

  // a profile can show many other account's
  Profile.hasMany(AccountLink, {
    foreignKey: "profileId",
    as: "accounts",
    onDelete: "CASCADE",
  });
  AccountLink.belongsTo(Profile, { foreignKey: "profileId" });
};

export default profileAssociations;
