import User from "../models/User.js";
import Upload from "../models/Upload.js";

const uploadAssociations = () => {
  // increment when user uploads
  Upload.afterCreate(async (payload, options) => {
    User.increment("uploads", {
      by: 1,
      where: { id: payload.userId },
      transaction: options.transaction,
    });
  });

  // decrement when user remove uploads
  Upload.afterDestroy(async (payload, options) => {
    User.decrement("uploads", {
      by: 1,
      where: { id: payload.userId },
      transaction: options.transaction,
    });
  });
};

export default uploadAssociations;
