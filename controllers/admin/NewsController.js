import { timestampsKeys } from "../../constants/timestamps.js";
import { Category_ } from "../../services/CategoryService.js";
import { logOk, logServerErr } from "../../services/LogService.js";
import { News_ } from "../../services/NewsService.js";
import { toNumber } from "../../utils/number.js";
import { serviceResultBadHandler } from "../../utils/services.js";
import { toString } from "../../utils/string.js";

class AdminNewsController {
  static create = async (req, res) => {
    const body = req.body;

    try {
      let result = await News_.create(
        body.title,
        body.body,
        body.hindiTitle,
        body.hindiBody,
        body.imageUrl,
        body.newsUrl,
        body.category,
        body.status
      );
      if (serviceResultBadHandler(result, res, "News creation failed")) return;

      const news = result.info.news;

      res.ok("News created", { news });

      logOk("News created successfully", "Admin created the news", { news });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static update = async (req, res) => {
    const newsId = req.body.newsId;

    try {
      let result = await News_.update(req.body, newsId);
      if (serviceResultBadHandler(result, res, "News update failed")) return;

      const news = result.info.news;

      res.ok("News updated", { news });

      logOk(
        "News updated successfully",
        `Admin updated a news with id: ${newsId}`,
        { news }
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static delete = async (req, res) => {
    let newsId = toString(req.query.newsId).split("|");

    try {
      let result = await News_.delete(newsId);
      if (serviceResultBadHandler(result, res, "News deletion failed")) return;

      res.ok("News deleted");

      logOk(
        "News deleted successfully",
        `Admin deleted a news with id: ${req.query.newsId}`
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static get = async (req, res) => {
    const page = toNumber(req.query.page);
    const offset = toNumber(req.query.offset);
    let order = req.query.order ?? `[["${timestampsKeys.createdAt}", "desc"]]`;

    try {
      order = JSON.parse(order);
      let result = await News_.getByOffset(
        page,
        res.originalQuery,
        order,
        offset
      );
      if (serviceResultBadHandler(result, res, "News fetch failed (admin)"))
        return;

      const news = result.info.news;

      res.ok("News fetched", {
        news,
        newOffset: news.length < News_.newsLimit ? null : news.length,
        isOver: result.info.isOver,
      });

      logOk("News fetched successfully", "Admin requested news");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getCategories = async (req, res) => {
    try {
      let result = await Category_.get();

      if (
        serviceResultBadHandler(result, res, "Categories fetch failed (admin)")
      )
        return;

      const categories = result.info.categories;

      res.ok("Categories found", { categories });

      logOk("Categories fetched", "Admin requested for categories list", null);
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default AdminNewsController;
