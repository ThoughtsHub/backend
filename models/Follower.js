import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Profile from "./Profile.js";

const Follower = db.define(
  "Follower",
  {
    id: { ...types.ID },
    profileId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Profile, key: "id" },
    },
    followerId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Profile, key: "id" },
    },
    ...timestamps,
  },
  { hooks }
);

export default Follower;
