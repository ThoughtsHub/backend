import { Op } from "sequelize";
import { includeProfile } from "../constants/include.js";
import { timestampsKeys } from "../constants/timestamps.js";
import db from "../db/pg.js";
import WordleRank from "../models/Wordle_Rank.js";
import WordleWord, {
  status,
  status as WordleWordStatus,
} from "../models/Wordle_Word.js";
import { getTodayDate, getTodayIstTime } from "../utils/date.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";

class WordleService {
  // Wordle service response codes
  static codes = {
    NO_WORD_ON_DAY: [
      "NO WORD ON THIS DAY",
      "No word was specified on this day",
    ],
  };

  static rankingsLimit = 30;
  static wordsLimit = 30;

  static create = async (
    day,
    word,
    hindiTranslation,
    englishMeaning,
    hindiMeaning,
    englishSentenceUse,
    hindiSentenceUse,
    status = WordleWordStatus.Draft
  ) => {
    try {
      let wordleWord = await WordleWord.create({
        word,
        hindiTranslation,
        englishMeaning,
        hindiMeaning,
        englishSentenceUse,
        hindiSentenceUse,
        day,
        status,
      });

      wordleWord = wordleWord.get({ plain: true });

      return sRes(serviceCodes.OK, { word: wordleWord });
    } catch (err) {
      return sRes(
        serviceCodes.DB_ERR,
        {
          word,
          hindiTranslation,
          englishMeaning,
          hindiMeaning,
          englishSentenceUse,
          hindiSentenceUse,
          day,
        },
        err
      );
    }
  };

  static update = async (wordId, values) => {
    const valuesToBeUpdated = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "word":
          if (Validate.wordleWord(val)) valuesToBeUpdated.word = val;
          break;

        case "hindiTranslation":
          if (Validate.wordleFields(val))
            valuesToBeUpdated.hindiTranslation = val;
          break;

        case "hindiMeaning":
          if (Validate.wordleFields(val)) valuesToBeUpdated.hindiMeaning = val;
          break;

        case "englishMeaning":
          if (Validate.wordleFields(val))
            valuesToBeUpdated.englishMeaning = val;
          break;

        case "englishSentenceUse":
          if (Validate.wordleFields(val))
            valuesToBeUpdated.englishSentenceUse = val;
          break;

        case "hindiSentenceUse":
          if (Validate.wordleFields(val))
            valuesToBeUpdated.hindiSentenceUse = val;
          break;

        case "status":
          if (Validate.wordleStatus(val)) valuesToBeUpdated.status = val;
          break;
      }
    }

    const t = await db.transaction();
    try {
      const [updateResult] = await WordleWord.update(valuesToBeUpdated, {
        where: { id: wordId },
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { values, wordId });
      }

      let wordleWord = await WordleWord.findByPk(wordId);
      wordleWord = wordleWord.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { word: wordleWord });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { values, wordId }, err);
    }
  };

  static delete = async (wordId) => {
    const t = await db.transaction();

    try {
      const deleteResult = await WordleWord.destroy({
        where: { id: wordId },
        transaction: t,
        individualHooks: true,
      });

      if (deleteResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { wordId });
      }

      await t.commit();
      return sRes(serviceCodes.OK);
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { wordId }, err);
    }
  };

  static getWordByDay = async (day = getTodayDate()) => {
    try {
      let word = await WordleWord.findOne({
        where: {
          day,
          status: status.Published,
          [timestampsKeys.createdAt]: { [Op.lte]: getTodayIstTime() },
        },
      });
      if (word === null) return sRes(this.codes.NO_WORD_ON_DAY, { day });
      word = word.get({ plain: true });

      return sRes(serviceCodes.OK, { word });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { day }, err);
    }
  };

  static setResultForUser = async (
    guessedCorrectly = true,
    day = getTodayDate(),
    profileId
  ) => {
    const t = await db.transaction();
    guessedCorrectly = guessedCorrectly === true;

    try {
      const word = await WordleWord.findOne({
        where: { day, status: status.Published },
        transaction: t,
      });
      if (word === null) {
        await t.rollback();
        return sRes(this.codes.NO_WORD_ON_DAY, {
          guessedCorrectly,
          day,
          profileId,
        });
      }

      const wordleUser = await WordleRank.create(
        { wordId: word.id, profileId, guessedCorrectly },
        { transaction: t }
      );

      const totalWordleUsersForDay = await WordleRank.count({
        where: { guessedCorrectly: true, wordId: word.id },
        transaction: t,
      });
      if (guessedCorrectly) {
        let [updateResult] = await WordleRank.update(
          { rank: totalWordleUsersForDay },
          { where: { wordId: word.id, profileId }, transaction: t }
        );

        if (updateResult !== 1) {
          await t.rollback();
          return sRes(serviceCodes.DB_ERR, {
            guessedCorrectly,
            day,
            profileId,
          });
        }

        let [[_, updateResult2]] = await WordleWord.increment(
          { solvedBy: 1 },
          { where: { id: word.id }, transaction: t }
        );

        if (updateResult2 !== 1) {
          await t.rollback();
          return sRes(serviceCodes.DB_ERR, {
            guessedCorrectly,
            day,
            profileId,
          });
        }
      }

      let wordleUserRank = await WordleRank.findOne({
        where: { wordId: word.id, profileId },
        transaction: t,
      });
      wordleUserRank = wordleUserRank.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { user: wordleUserRank });
    } catch (err) {
      await t.rollback();
      return sRes(
        serviceCodes.DB_ERR,
        { guessedCorrectly, day, profileId },
        err
      );
    }
  };

  static getRankingsByOffset = async (day, offset = 0) => {
    try {
      const word = await WordleWord.findOne({ where: { day } });
      if (word === null)
        return sRes(serviceCodes.NO_WORD_ON_DAY, { day, offset });

      let rankings = await WordleRank.findAll({
        where: { wordId: word.id, guessedCorrectly: true },
        offset,
        limit: this.rankingsLimit,
        order: [["rank", "asc"]],
        include: [includeProfile],
      });
      rankings = rankings.map((r) => r.get({ plain: true }));

      return sRes(serviceCodes.OK, { rankings });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { day, offset }, err);
    }
  };

  static getResultOfUser = async (day, profileId) => {
    try {
      const word = await WordleWord.findOne({ where: { day } });
      if (word === null)
        return sRes(this.codes.NO_WORD_ON_DAY, { day, profileId });

      const wordleUser = await WordleRank.findOne({
        where: { wordId: word.id, profileId },
      });

      const userResult = {
        attempted: wordleUser !== null,
        guessedCorrectly: wordleUser?.guessedCorrectly,
        rank: wordleUser?.rank,
      };

      return sRes(serviceCodes.OK, { userResult });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { day, profileId }, err);
    }
  };

  static getWords = async (offset, admin = false) => {
    try {
      let words = await WordleWord.findAll({
        where: admin
          ? {}
          : {
              status: WordleWordStatus.Published,
              [timestampsKeys.createdAt]: { [Op.lt]: getTodayIstTime() },
            },
        offset,
        limit: this.wordsLimit,
        order: [[timestampsKeys.createdAt, "desc"]],
      });
      words = words.map((w) => w.get({ plain: true }));

      return sRes(serviceCodes.OK, { words });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset }, err);
    }
  };
}

export const Wordle_ = WordleService;
