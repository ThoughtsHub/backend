import { toNumber } from "../utils/number.js";
import { News_ } from "../services/NewsService.js";
import { Category_ } from "../services/CategoryService.js";
import { serviceCodes } from "../utils/services.js";
import { logBad, logOk, logServerErr } from "../services/LogService.js";

class NewsController {
  static get = async (req, res) => {
    let { categories = "", timestamp } = req.query;

    categories = categories.split("|");
    timestamp = toNumber(timestamp);

    try {
      let result = await News_.getByTimestamp(timestamp, categories);
      if (result.code !== serviceCodes.OK) {
        logBad(
          "News fetch failed",
          `A user requested to view news; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      const news = result.info.news;

      res.ok("News fetched", { news });

      logBad("News fetched", "A user requested to view news", null);
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getCategories = async (req, res) => {
    try {
      let result = await Category_.get();
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Categories fetch failed",
          `Reason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      const categories = result.info.categories;

      res.ok("Categories found", { categories });

      logOk("Categories fetched", "A user requested for categories list", null);
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default NewsController;
