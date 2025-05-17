import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Profile from "./Profile.js";

const Forum = db.define(
  "Forum",
  {
    id: { ...types.ID },
    profileId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Profile, key: "id" },
    },
    localId: { ...types.STRING },
    title: { ...types.STR_REQ },
    body: { ...types.TEXT_REQ },
    imageUrl: { ...types.STRING },
    comments: { ...types.INT_REQ_0 },
    appreciations: { ...types.INT_REQ_0 },
    ...timestamps,
  },
  { hooks }
);

export default Forum;
