import { DataTypes } from "sequelize";

const ID = {
  type: DataTypes.UUID,
  primaryKey: true,
  defaultValue: DataTypes.UUIDV4,
  allowNull: false,
  unique: true,
};

const FALSE_BOOL = {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  allowNull: false,
};

const UNIQUE_STR = {
  type: DataTypes.STRING,
  unique: true,
};

const STR_REQ = {
  type: DataTypes.STRING,
  allowNull: false,
};

const TEXT_REQ = {
  type: DataTypes.TEXT,
  allowNull: false,
};

const UNIQ_STR_REQ = {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
};

const INTEGER = {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
};

const ATTR = {
  ID,
  FALSE_BOOL,
  UNIQUE_STR,
  STR_REQ,
  TEXT_REQ,
  UNIQ_STR_REQ,
  INTEGER,
};

export default ATTR;
