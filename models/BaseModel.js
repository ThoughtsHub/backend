import { DataTypes as dt } from "sequelize";

export const baseModelConfig = {
  createdAt: {
    type: dt.BIGINT, // Store timestamps in milliseconds
    allowNull: false,
    defaultValue: () => Date.now(), // Set default value to current time in milliseconds
  },
  updatedAt: {
    type: dt.BIGINT, // Store timestamps in milliseconds
    allowNull: false,
    defaultValue: () => Date.now(), // Set default value to current time in milliseconds
  },
};

export const baseModelOptions = {
  timestamps: false, // Disable Sequelize's default timestamp handling
  hooks: {
    beforeCreate: (instance) => {
      instance.createdAt = Date.now();
      instance.updatedAt = Date.now();
    },
    beforeUpdate: (instance) => {
      instance.updatedAt = Date.now();
    },
  },
};

const baseModel = {
  config: baseModelConfig,
  options: baseModelOptions,
};

export default baseModel;
