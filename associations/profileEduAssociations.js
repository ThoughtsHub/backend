import Institute from "../models/Institute.js";
import Profile from "../models/Profile.js";
import ProfileEducation from "../models/ProfileEducation.js";

export const profileEducationAssociations = () => {
  Profile.hasMany(ProfileEducation, {
    foreignKey: "profileId",
    onDelete: "CASCADE",
    as: "education",
  });
  ProfileEducation.belongsTo(Profile, {
    foreignKey: "profileId",
    as: "profile",
  });

  Institute.hasMany(ProfileEducation, {
    foreignKey: "instituteId",
    onDelete: "CASCADE",
  });
  ProfileEducation.belongsTo(Institute, {
    foreignKey: "instituteId",
    as: "institute",
  });
};
