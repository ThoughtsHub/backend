import { DataTypes } from "sequelize";

const ID = {
  type: DataTypes.UUID,
  primaryKey: true,
  defaultValue: DataTypes.UUIDV4,
  allowNull: false,
  unique: true,
};

const DEFAULT = {
  STRING: "Default",
  INTEGER: 0,
};

const HANDLE = {
  limit: 32,
};

const attr = {
  id: ID,
  default: DEFAULT,
  handle: HANDLE,
};

export default attr;
