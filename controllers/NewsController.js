import { toNumber } from "../utils/number.js";
import { News_ } from "../services/NewsService.js";
import { Category_ } from "../services/CategoryService.js";
import { logOk, logServerErr } from "../services/LogService.js";
import { serviceResultBadHandler } from "../utils/services.js";

class NewsController {
  static get = async (req, res) => {
    let { category: categories, timestamp } = req.query;
    categories ??= "";

    categories = categories.split("|");
    timestamp = toNumber(timestamp);

    try {
      let result = await News_.getByTimestamp(timestamp, categories);

      if (serviceResultBadHandler(result, res, "News fetch failed")) return;

      const news = result.info.news;

      res.ok("News fetched", { news });

      logOk("News fetched", "A user requested to view news", null);
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getCategories = async (req, res) => {
    try {
      let result = await Category_.get();

      if (serviceResultBadHandler(result, res, "Categories fetch failed"))
        return;

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
