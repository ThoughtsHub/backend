import { DataTypes as dt } from "sequelize";

const ID = {
  type: dt.UUID,
  primaryKey: true,
  defaultValue: dt.UUIDV4,
  allowNull: false,
  unique: true,
};

const STR_REQ = { type: dt.STRING, allowNull: false };

const UNIQUE_STR_REQ = { type: dt.STRING, allowNull: false, unique: true };

const TEXT_REQ = { type: dt.TEXT, allowNull: false };

const INTEGER_REQ = { type: dt.INTEGER, allowNull: false };

const INT_REQ_0 = { type: dt.INTEGER, allowNull: false, defaultValue: 0 };

const BOOL_FALSE = { type: dt.BOOLEAN, allowNull: false, defaultValue: false };

const BOOL_TRUE = { type: dt.BOOLEAN, allowNull: false, defaultValue: true };

const dataTypesFromSequelize = () => {
  const types = {};
  for (const type in dt) {
    types[type] = { type: dt[type] };
  }
  return types;
};

export const types = {
  ID,
  STR_REQ,
  UNIQUE_STR_REQ,
  TEXT_REQ,
  INTEGER_REQ,
  INT_REQ_0,
  BOOL_TRUE,
  BOOL_FALSE,
  ...dataTypesFromSequelize(),
};
