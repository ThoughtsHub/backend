import Institute from "../models/Institute.js";
import InsituteDiscussion from "../models/InstituteDiscussion.js";
import InstituteReview from "../models/InstituteReviews.js";

export const instituteAssociations = () => {
  Institute.hasMany(Institute, {
    foreignKey: "universityId",
  });
  Institute.belongsTo(Institute, {
    foreignKey: "universityId",
    as: "university",
    onDelete: "SET NULL",
  });

  Institute.hasMany(InstituteReview, {
    foreignKey: "instituteId",
    as: "reviews",
    onDelete: "CASCADE",
  });
  InstituteReview.belongsTo(Institute, {
    foreignKey: "instituteId",
    as: "institute",
  });
  
  Institute.hasMany(InsituteDiscussion, {
    foreignKey: "instituteId",
    as: "discussions",
    onDelete: "CASCADE",
  });
  InsituteDiscussion.belongsTo(Institute, {
    foreignKey: "instituteId",
    as: "institute",
  });
};
