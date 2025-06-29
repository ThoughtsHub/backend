import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Institute from "./Institute.js";
import Profile from "./Profile.js";

const InstituteReview = db.define(
  "InstituteReview",
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
    review: { ...types.TEXT_REQ },
    rating: { ...types.INT_REQ_0, validate: { max: 5, min: 0 } },
    ...timestamps,
  },
  { hooks }
);

export default InstituteReview;
