import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";

export const status = {
  Draft: "Draft",
  Published: "Published",
};

const WordleWord = db.define(
  "WordleWord",
  {
    id: { ...types.ID },
    day: { ...types.UNIQUE_STR_REQ },
    word: { ...types.UNIQUE_STR_REQ },
    hindiTranslation: { ...types.STRING },
    englishMeaning: { ...types.TEXT },
    hindiMeaning: { ...types.TEXT },
    solvedBy: { ...types.INT_REQ_0 },
    status: {
      ...types.ENUM,
      defaultValue: status.Draft,
      values: Object.values(status),
    },
    ...timestamps,
  },
  { hooks }
);

export default WordleWord;
