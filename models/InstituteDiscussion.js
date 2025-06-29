import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Institute from "./Institute.js";
import Profile from "./Profile.js";

const InsituteDiscussion = db.define(
  "InsituteDiscussion",
  {
    id: { ...types.ID },
    instituteId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Institute, key: "id" },
    },
    profileId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Profile, key: "id" },
    },
    discussionId: {
      ...types.FOREIGN_ID,
      references: { model: "InsituteDiscussions", key: "id" },
    },
    body: { ...types.TEXT_REQ },
    replies: {...types.INT_REQ_0},
    ...timestamps,
  },
  { hooks }
);

export default InsituteDiscussion;
