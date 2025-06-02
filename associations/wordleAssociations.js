import Profile from "../models/Profile.js";
import WordleRank from "../models/Wordle_Rank.js";
import WordleWord from "../models/Wordle_Word.js";

export const wordleAssociations = () => {
  Profile.hasMany(WordleRank, {
    foreignKey: "profileId",
    as: "profile",
  });
  WordleRank.belongsTo(Profile, { foreignKey: "profileId", as: "profile" });

  WordleWord.hasMany(WordleRank, { foreignKey: "wordId" });
  WordleRank.belongsTo(WordleWord, { foreignKey: "wordId" });
};
