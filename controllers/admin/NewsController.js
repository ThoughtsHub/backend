import { timestampsKeys } from "../../constants/timestamps.js";
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
    const offset = toNumber(req.query.offset);
    const order = req.query.order ?? [[timestampsKeys.createdAt, "desc"]];

    try {
      let result = await News_.getByOffset(offset, res.originalQuery, order);
      if (serviceResultBadHandler(result, res, "News fetch failed (admin)"))
        return;

      const news = result.info.news;

      res.ok("News fetched", { news });

      logOk("News fetched successfully", "Admin requested news");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default AdminNewsController;
