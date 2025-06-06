import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Profile from "./Profile.js";

export const status = {
  PENDING: "Pending",
  CHECKED: "Checked",
  USED: "Used",
};

const Feedback = db.define(
  "Feedback",
  {
    id: { ...types.ID },
    profileId: {
      ...types.FOREIGN_ID,
      references: { model: Profile, key: "id" },
    },
    message: { ...types.STR_REQ },
    status: {
      ...types.ENUM,
      values: Object.values(status),
      defaultValue: status.PENDING,
    },
    ...timestamps,
  },
  { hooks }
);

export default Feedback;
