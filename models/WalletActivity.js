import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Profile from "./Profile.js";

const WalletActivity = db.define(
  "WalletActivity",
  {
    id: { ...types.ID },
    profileId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Profile, key: "id" },
    },
    value: { ...types.INTEGER_REQ },
    type: {
      ...types.STRING,
      values: ["EXPENSE", "INCOME"],
      defaultValue: "EXPENSE",
    },
    description: { ...types.TEXT },
    ...timestamps,
  },
  { hooks }
);

export default WalletActivity;
