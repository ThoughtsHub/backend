import Institute from "../models/Institute.js";

export const instituteAssociations = () => {
  Institute.hasMany(Institute, {
    foreignKey: "universityId",
  });
  Institute.belongsTo(Institute, {
    foreignKey: "universityId",
    as: "university",
    onDelete: "SET NULL",
  });
};
