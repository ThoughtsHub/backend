import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Profile from "./Profile.js";
import Forum from "./Forum.js";

const ForumComment = db.define(
  "ForumComment",
  {
    id: { ...types.ID },
    profileId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Profile, key: "id" },
    },
    forumId: {
      ...types.FOREIGN_ID,
      references: { model: Forum, key: "id" },
    },
    localId: { ...types.STRING },
    body: { ...types.TEXT_REQ },
    ...timestamps,
  },
  { hooks }
);

export default ForumComment;
