import { status as WStatus } from "../../models/Wordle_Word.js";
import { logOk, logServerErr } from "../../services/LogService.js";
import { Wordle_ } from "../../services/WordleService.js";
import { toNumber } from "../../utils/number.js";
import { serviceResultBadHandler } from "../../utils/services.js";

class AdminWordleController {
  static getWords = async (req, res) => {
    let { offset } = req.query;
    offset = toNumber(offset);

    try {
      const result = await Wordle_.getWords(offset, true);
      if (
        serviceResultBadHandler(
          result,
          res,
          "Fetching for words failed (admin)"
        )
      )
        return;

      const words = result.info.words;

      res.ok("Wordle words", { words });

      logOk("Wordle words fetched", "Admin requested for wordle words", {
        offset,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static create = async (req, res) => {
    const {
      day,
      word,
      hindiTranslation,
      englishMeaning,
      hindiMeaning,
      englishSentenceUse,
      hindiSentenceUser,
      status = WStatus.Draft,
    } = req.body;

    try {
      const result = await Wordle_.create(
        day,
        word,
        hindiTranslation,
        englishMeaning,
        hindiMeaning,
        status
      );
      if (serviceResultBadHandler(result, res, "Wordle word creation failed"))
        return;

      const wordleWord = result.info.word;

      res.ok("Wordle word created", { word: wordleWord });

      logOk("Wordle word created", "Admin created a wordle word", {
        day,
        word,
        hindiTranslation,
        englishMeaning,
        hindiMeaning,
        englishSentenceUse,
        hindiSentenceUser,
        status,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static update = async (req, res) => {
    const { wordId } = req.body;

    try {
      const result = await Wordle_.update(wordId, res.originalBody);
      if (serviceResultBadHandler(result, res, "Wordle word updation failed"))
        return;

      const wordleWord = result.info.word;

      res.ok("Wordle word updated", { word: wordleWord });

      logOk("Wordle word updated", "Admin updated a wordle word", {
        wordId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static delete = async (req, res) => {
    const { wordId } = req.query;

    try {
      const result = await Wordle_.delete(wordId);
      if (serviceResultBadHandler(result, res, "Wordle word deletion failed"))
        return;

      res.ok("Wordle word deleted");

      logOk("Wordle word updated", "Admin deleted a wordle word", {
        wordId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default AdminWordleController;
