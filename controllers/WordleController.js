import { logOk, logServerErr } from "../services/LogService.js";
import { Wordle_ } from "../services/WordleService.js";
import { isString } from "../utils/checks.js";
import { getTodayDate } from "../utils/date.js";
import { toNumber } from "../utils/number.js";
import { serviceResultBadHandler } from "../utils/services.js";

class WordleController {
  static getTodayWord = async (req, res) => {
    try {
      const result = await Wordle_.getWordByDay();
      if (
        serviceResultBadHandler(result, res, "Fetching for today's word failed")
      )
        return;

      const word = result.info.word;

      res.ok("Today's wordle word", { word });

      logOk(
        "Wordle word fetched",
        "A user requested for today's daily wordle word",
        { word }
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getByDate = async (req, res) => {
    const { day } = req.query;

    try {
      const result = await Wordle_.getWordByDay(day);
      if (serviceResultBadHandler(result, res, "Fetching for word failed"))
        return;

      const word = result.info.word;

      res.ok("Wordle word", { word });

      logOk(
        "Wordle word fetched",
        "A user requested for daily wordle word for a specific day",
        { word, day }
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getWords = async (req, res) => {
    let { offset } = req.query;
    offset = toNumber(offset);

    try {
      const result = await Wordle_.getWords(offset);
      if (serviceResultBadHandler(result, res, "Fetching for words failed"))
        return;

      const words = result.info.words;

      res.ok("Wordle words", {
        words,
        newOffset:
          words.length < Wordle_.wordsLimit ? null : offset + words.length,
      });

      logOk("Wordle words fetched", "A user requested for wordle words", {
        offset,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static setResult = async (req, res) => {
    const profileId = req.user.profile.id;
    let { guessedCorrectly, day } = req.body;
    guessedCorrectly ??= true;
    day ??= getTodayDate();

    try {
      let result = await Wordle_.setResultForUser(
        guessedCorrectly,
        day,
        profileId
      );
      if (
        serviceResultBadHandler(
          result,
          res,
          "Setting result for user of wordle failed"
        )
      )
        return;

      result = result.info.result;

      res.ok("Set result for user", { result });

      logOk(
        "Set result for the user",
        `A user ${
          guessedCorrectly ? "solved" : "attempted"
        } wordle for this day`,
        { profileId, guessedCorrectly, day }
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getResult = async (req, res) => {
    let profileId = req?.user?.profile?.id;
    let { day, offset = 0 } = req.query;
    offset = toNumber(offset);
    day ??= getTodayDate();
    if (!isString(profileId)) profileId = null;

    try {
      const result1 = await Wordle_.getResultOfUser(day, profileId);
      if (
        serviceResultBadHandler(result1, res, "Getting result for user failed")
      )
        return;

      const result2 = await Wordle_.getRankingsByOffset(day, offset);
      if (
        serviceResultBadHandler(
          result2,
          res,
          "Getting rankings for wordle result failed"
        )
      )
        return;

      let result = result1.info.userResult,
        rankings = result2.info.rankings;

      res.ok("Wordle results", {
        userResult: result,
        rankings,
        newOffset:
          rankings < Wordle_.rankingsLimit ? null : offset + rankings.length,
      });

      logOk("Wordle results", "A user requested for wordle results", {
        day,
        offset,
        profileId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default WordleController;
