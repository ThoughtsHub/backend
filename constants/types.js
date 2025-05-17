import { DataTypes as dt } from "sequelize";

const ID = {
  type: dt.UUID,
  primaryKey: true,
  defaultValue: dt.UUIDV4,
  allowNull: false,
  unique: true,
};

const FOREIGN_ID_REQ = {
  type: dt.UUID,
  allowNull: false,
};

const FOREIGN_ID = {
  type: dt.UUID,
  allowNull: true,
};

const UNIQUE_FOREIGN_ID = {
  type: dt.UUID,
  allowNull: true,
  unique: true,
};

const UNIQUE_FOREIGN_ID_REQ = {
  type: dt.UUID,
  allowNull: false,
  unique: true,
};

const STR_REQ = { type: dt.STRING, allowNull: false };

const UNIQUE_STR_REQ = { type: dt.STRING, allowNull: false, unique: true };

const UNIQUE_STR = { type: dt.STRING, allowNull: true, unique: true };

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
  FOREIGN_ID,
  FOREIGN_ID_REQ,
  UNIQUE_FOREIGN_ID,
  UNIQUE_FOREIGN_ID_REQ,
  STR_REQ,
  UNIQUE_STR,
  UNIQUE_STR_REQ,
  TEXT_REQ,
  INTEGER_REQ,
  INT_REQ_0,
  BOOL_TRUE,
  BOOL_FALSE,
  ...dataTypesFromSequelize(),
};
