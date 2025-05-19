import { timestampsKeys } from "../../constants/timestamps.js";
import { ForumComment_ } from "../../services/ForumCommentService.js";
import { Forum_ } from "../../services/ForumService.js";
import { logOk, logServerErr } from "../../services/LogService.js";
import { toNumber } from "../../utils/number.js";
import { serviceResultBadHandler } from "../../utils/services.js";
import { toString } from "../../utils/string.js";

class AdminForumController {
  static get = async (req, res) => {
    const offset = toNumber(req.query.offset);
    const order = req.query.order ?? [[timestampsKeys.createdAt, "desc"]];

    try {
      let result = await Forum_.getByOffset(offset, res.originalQuery, order);
      if (serviceResultBadHandler(result, res, "Forums fetch failed (admin)"))
        return;

      const forums = result.info.forums;

      res.ok("Forums fetched", { forums });

      logOk("Forums fetched successfully", "Admin requested for forums");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static delete = async (req, res) => {
    const { forumId, profileId, reason = "No reason" } = req.query;
    let forumIds = toString(forumId).split("|");

    try {
      let result = await Forum_.delete(forumIds, profileId);
      if (serviceResultBadHandler(result, res, "Forum deletion failed (admin)"))
        return;

      res.ok("Forum deleted");

      logOk(
        "Forum deleted successfully",
        `Admin deleted a forum due to ${reason}`
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getAppreciations = async (req, res) => {
    const offset = toNumber(req.query.offset);
    const order = req.query.order ?? [[timestampsKeys.createdAt, "desc"]];

    try {
      let result = await Forum_.appreciations(offset, res.originalQuery, order);
      if (
        serviceResultBadHandler(
          result,
          res,
          "Appreciations fetch failed (admin)"
        )
      )
        return;

      const appreciations = result.info.appreciations;

      res.ok("Appreciations fetched", { appreciations });

      logOk(
        "Appreciations fetched successfully",
        "Admin requested appreciations"
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getComments = async (req, res) => {
    const offset = toNumber(req.query.offset);
    const order = req.query.order ?? [[timestampsKeys.createdAt, "desc"]];

    try {
      let result = await ForumComment_.getByOffset(
        offset,
        res.originalQuery,
        order
      );
      if (serviceResultBadHandler(result, res, "Comments fetch failed (admin)"))
        return;

      const comments = result.info.comments;

      res.ok("Comments", { comments });

      logOk("Comments fetched", "Admin requested for comments");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static deleteComment = async (req, res) => {
    const { commentId, forumId, profileId, reason = "No reason" } = req.query;
    let commentIds = toString(commentId).split("|");

    try {
      let result = await ForumComment_.delete(commentIds, forumId, profileId);
      if (
        serviceResultBadHandler(
          result,
          res,
          "Forum comment deletion failed (admin)"
        )
      )
        return;

      res.ok("Comment deleted");

      logOk(
        "Comment deleted on a forum successfully",
        `Admin deleted a comment due to ${reason}`
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default AdminForumController;
