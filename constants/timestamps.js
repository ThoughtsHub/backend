import { types } from "./db.js";

const createdAt = {
  type: types.BIGINT,
};

const updatedAt = {
  type: types.BIGINT,
};

const beforeCreate = (model, _) => {
  const timeNow = Date.now();
  model.createdAt = timeNow;
  model.updatedAt = timeNow;
};

const beforeUpdate = (model, _) => {
  model.updatedAt = Date.now();
};

export const timestamps = { createdAt, updatedAt };

export const hooks = { beforeCreate, beforeUpdate };