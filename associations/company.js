import Address from "../models/Address.js";
import Company from "../models/Company.js";
import PrivateJob from "../models/Job.js";

const companyAssociations = () => {
  // a private job has to have a provider
  Company.hasMany(PrivateJob, {
    foreignKey: "companyId",
    as: "jobs",
    onDelete: "CASCADE",
  });
  PrivateJob.belongsTo(Company, { foreignKey: "companyId", as: "provider" });

  // a company has many addresses
  Company.hasMany(Address, { foreignKey: "companyId", onDelete: "SET NULL" });
  Address.belongsTo(Company, { foreignKey: "companyId" });
};

export default companyAssociations;
