import { types } from "../constants/db.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

const Story = db.define(
  "Story",
  {
    id: { ...types.ID },
    localId: { ...types.STRING },
    title: { ...types.STR_REQ },
    body: { ...types.TEXT_REQ },
    caption: { ...types.STRING },
    category: { ...types.STR_REQ },
    genre: { ...types.STRING },
    color: { ...types.STRING },
    backgroundColor: { ...types.STRING },
    backgroundImageId: { ...types.STRING },
    alignment: { ...types.INTEGER },
    ...timestamps,
  },
  { hooks }
);

export default Story;
