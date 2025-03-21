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

const BOOL_FALSE = { type: dt.BOOLEAN, allowNull: false, default: false };

const BOOL_TRUE = { type: dt.BOOLEAN, allowNull: false, default: true };

export const types = {
  ID,
  STR_REQ,
  UNIQUE_STR_REQ,
  TEXT_REQ,
  INTEGER_REQ,
  BOOL_TRUE,
  BOOL_FALSE,
  ...dt,
};
