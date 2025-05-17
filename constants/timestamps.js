import { types } from "./types.js";

export const timestampsKeys = {
  createdAt: "createDate",
  updatedAt: "updateDate",
};

const createdAt = { ...types.BIGINT };

const updatedAt = { ...types.BIGINT };

const beforeCreate = (model, _) => {
  const timeNow = Date.now();
  model[timestampsKeys.createdAt] = timeNow;
  model[timestampsKeys.updatedAt] = timeNow;
};

const beforeUpdate = (model, _) => {
  model[timestampsKeys.updatedAt] = Date.now();
};

export const timestamps = {
  [timestampsKeys.createdAt]: createdAt,
  [timestampsKeys.updatedAt]: updatedAt,
};

export const hooks = { beforeCreate, beforeUpdate };
