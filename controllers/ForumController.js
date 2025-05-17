import activity from "../services/ActivityService.js";
import { Forum_ } from "../services/ForumService.js";
import { ForumComment_ } from "../services/ForumCommentService.js";
import { logBad, logOk, logServerErr } from "../services/LogService.js";
import { toNumber } from "../utils/number.js";
import { serviceCodes } from "../utils/services.js";

class ForumController {
  static create = async (req, res) => {
    const profileId = req.user.profile.id;
    const body = req.body;

    try {
      let result = await Forum_.create(
        body.localId,
        body.title,
        body.body,
        body.imageUrl,
        profileId
      );
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Forum creation failed",
          `A user failed to create a forum; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      const forum = result.info.forum;

      res.ok("Forum created", { forum });

      logOk("Forum created", "A user created a forum", { forum });
      activity("Forum Created", "A user created a forum");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static update = async (req, res) => {
    const profileId = req.user.profile.id;

    try {
      let result = await Forum_.update(req.body, profileId, req.body.id);
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Forum updation failed",
          `A user failed to update a forum; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      const forum = result.info.forum;

      res.ok("Forum updated", { forum });

      logOk("Forum updated", "A user updated a forum", { forum });
      activity("Forum Update", "A user updated a forum");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static delete = async (req, res) => {
    const profileId = req.user.profile.id;
    let forumId = req.query.forumId;

    forumId = forumId.split("|");

    try {
      let result = await Forum_.delete(forumId, profileId);
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Forum deletion failed",
          `A user failed to delete forums; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      res.ok("Forum deleted");

      logOk("Forum deleted", "A user deleted forum(s)");
      activity("Forum delete", "A user deleted forum(s)");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static get = async (req, res) => {
    let { timestamp } = req.query;
    timestamp = toNumber(timestamp);

    try {
      let result = await Forum_.getByTimestamp(
        timestamp,
        req?.user?.profile?.id
      );
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Forum fetch failed",
          `A user failed to delete forums; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      const forums = result.info.forums;

      res.ok("Forums fetched", { forums });

      logOk("Forums fetched", "A user requested forums", {
        profileId: req?.user?.profile?.id,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static vote = async (req, res) => {
    const profileId = req.user.profile.id;
    const { forumId, value } = req.body;

    try {
      let result = await (value
        ? Forum_.appreciate(forumId, profileId)
        : Forum_.unappreciate(forumId, profileId));
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Forum appreciation failed",
          `A user failed to appreciate forum; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      res.ok(`${value ? "A" : "Una"}ppreciated forum`);

      logOk(
        "Forum appreciation success",
        `A user ${value ? "A" : "Una"}ppreciated a forum`
      );
      activity(
        `Forum ${value ? "A" : "Una"}ppreciation`,
        `A user ${value ? "A" : "Una"}ppreciated a forum`
      );
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static comment = async (req, res) => {
    const body = req.body;
    const profileId = req.user.profile.id;

    try {
      let result = await ForumComment_.create(
        body.localId,
        body.body,
        body.forumId,
        profileId
      );
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Comment on forum failed",
          `A user failed to comment on forum; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      const comment = result.info.comment;

      res.ok("Commented", { comment });

      logOk("Commented on Forum", "A user commented on forum", { comment });
      activity("Commented", "A user commented on forum");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static updateComment = async (req, res) => {
    const profileId = req.user.profile.id;

    try {
      let result = await ForumComment_.update(
        req.body,
        req.body.commentId,
        req.body.forumId,
        profileId
      );
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Comment update on forum failed",
          `A user failed to update its comment on forum; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      const comment = result.info.comment;

      res.ok("Updated", { comment });

      logOk("Comment udpated", "A user updated its comment on forum", {
        comment,
      });
      activity("Comment Update", "A user updated its comment on forum");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static deleteComment = async (req, res) => {
    const { commentId } = req.query;
    const profileId = req.user.profile.id;
    try {
      let result = await ForumComment_.deleteOne(commentId, profileId);
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Comment delete on forum failed",
          `A user failed to delete its comment on forum; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      res.ok("Deleted");

      logOk("Comment deleted", "A user deleted its comment on forum", null);
      activity("Comment Deleted", "A user deleted its comment on forum");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static getComments = async (req, res) => {
    let { timestamp, forumId } = req.query;
    timestamp = toNumber(timestamp);

    try {
      let result = await ForumComment_.getByTimestamp(timestamp, forumId);
      if (result.code !== serviceCodes.OK) {
        logBad(
          "Comment delete on forum failed",
          `A user failed to delete its comment on forum; \nReason: ${result.code}`,
          result.info
        );
        return res.failure(result.code);
      }

      const comments = result.info.comments;

      res.ok("Comments fetched", { comments });

      logOk("Comments fetched", "A user fetched comments", null);
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default ForumController;
