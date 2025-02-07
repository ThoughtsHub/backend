import Address from "../models/Address.js";
import PrivateJob from "../models/Job.js";

const jobAssociations = () => {
  // a private job has one address
  PrivateJob.hasOne(Address, {
    foreignKey: "jobId",
    onDelete: "SET NULL",
    as: "location",
  });
  Address.belongsTo(PrivateJob, { foreignKey: "jobId" });
};

export default jobAssociations;
