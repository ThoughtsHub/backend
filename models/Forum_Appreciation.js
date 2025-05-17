import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Profile from "./Profile.js";
import Forum from "./Forum.js";

const ForumAppreciation = db.define(
  "ForumAppreciation",
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
    value: { ...types.INTEGER_REQ, defaultValue: 1 },
    ...timestamps,
  },
  { hooks }
);

export default ForumAppreciation;
