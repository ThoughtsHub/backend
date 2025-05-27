import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Forum from "./Forum.js";
import Profile from "./Profile.js";

export const priority = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
};
export const status = {
  Ignored: "Ignored",
  Pending: "Pending",
  Resolved: "Resolved",
};

const ReportForum = db.define(
  "ReportForum",
  {
    id: { ...types.ID },
    profileId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Profile, key: "id" },
    },
    forumId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Forum, key: "id" },
    },
    reason: { ...types.STRING },
    priority: {
      ...types.ENUM,
      values: Object.values(priority),
      defaultValue: priority.medium,
    },
    status: {
      ...types.ENUM,
      values: Object.values(status),
      defaultValue: status.Pending,
    },
    ...timestamps,
  },
  { hooks }
);

export default ReportForum;
