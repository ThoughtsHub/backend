import { DataTypes } from "sequelize";

export const ID = {
  type: DataTypes.UUID,
  primaryKey: true,
  defaultValue: DataTypes.UUIDV4,
  allowNull: false,
  unique: true,
};

export const FALSE_BOOL = {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  allowNull: false,
};

export const UNIQUE_STR = {
  type: DataTypes.STRING,
  unique: true,
};

export const STR_REQ = {
  type: DataTypes.STRING,
  allowNull: false,
};

export const TEXT_REQ = {
  type: DataTypes.TEXT,
  allowNull: false,
};

export const UNIQ_STR_REQ = {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
};

export const INTEGER = {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
};

const attr = {
  id: ID,
  falseBool: FALSE_BOOL,
  uniqStr: UNIQUE_STR,
  strReq: STR_REQ,
  int: INTEGER,
};

export default attr;
