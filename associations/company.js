import Company from "../models/Company.js";
import PrivateJob from "../models/PrivateJob.js";

const F_KEY = "companyId";

const companyAssociation = () => {
  Company.hasMany(PrivateJob, { foreignKey: F_KEY, onDelete: "CASCADE" });
  PrivateJob.belongsTo(Company, { foreignKey: F_KEY });
};

export default companyAssociation;
