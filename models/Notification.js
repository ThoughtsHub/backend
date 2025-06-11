import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Profile from "./Profile.js";
import Forum from "./Forum.js";
import ForumComment from "./Forum_Comment.js";

export const variants = {
  LIKE: "LIKE",
  UNLIKE: "UNLIKE",
  COMMENT: "COMMENT",
};

const Notification = db.define(
  "Notification",
  {
    id: { ...types.ID },
    type: { ...types.STRING, values: Object.values(variants) },
    profileId: {
      ...types.FOREIGN_ID,
      references: { model: Profile, key: "id" },
    },
    forumId: { ...types.FOREIGN_ID, references: { model: Forum, key: "id" } },
    commentId: {
      ...types.FOREIGN_ID,
      references: { model: ForumComment, key: "id" },
    },
    fromProfileId: {
      ...types.FOREIGN_ID,
      references: { model: Profile, key: "id" },
    },
    notificationMessage: { ...types.STRING },
    notificationMessageDesc: { ...types.TEXT },
    ...timestamps,
  },
  { hooks }
);

export default Notification;
