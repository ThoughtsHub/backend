import { types } from "../constants/types.js";
import { hooks, timestamps } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Profile from "./Profile.js";
import WordleWord from "./Wordle_Word.js";

const WordleRank = db.define(
  "WordleRank",
  {
    id: { ...types.ID },
    profileId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: Profile, key: "id" },
    },
    wordId: {
      ...types.FOREIGN_ID_REQ,
      references: { model: WordleWord, key: "id" },
    },
    rank: { ...types.INTEGER },
    guessedCorrectly: {...types.BOOLEAN},
    ...timestamps,
  },
  { hooks }
);

export default WordleRank;
