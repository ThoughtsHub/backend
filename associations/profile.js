import Profile from "../models/Profile.js";
import Interest from "../models/Interest.js";
import AccountLink from "../models/AccountLink.js";
import Education from "../models/Education.js";
import Forum from "../models/Forum.js";

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

  // a profile can have many educations
  Profile.hasMany(Education, {
    foreignKey: "profileId",
    as: "education",
    onDelete: "CASCADE",
  });
  Education.belongsTo(Profile, { foreignKey: "profileId" });

  // a profile will have many forums
  Profile.hasMany(Forum, {
    foreignKey: "profileId",
    as: "postedForums",
    onDelete: "SET NULL",
  });
  Forum.belongsTo(Profile, { foreignKey: "profileId" });
};

export default profileAssociations;
