import db from "../db/pg.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";
import ForumComment from "../models/Forum_Comment.js";
import Forum from "../models/Forum.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { includeWriter, includeWriterWith } from "../constants/include.js";
import { Op } from "sequelize";
import sendNotification from "./NotificationService.js";
import Profile from "../models/Profile.js";

class ForumCommentService {
  // Forum comment service response codes
  static codes = {
    BAD_BODY: ["Bad Body", "Comment cannot be empty"],
    BAD_ASSOCIATION: ["Bad Association", "Comment doesn't belong to you"],
    BAD_LOCALID: ["Bad LocalId", "Invalid localId, should be a string"],
  };

  static commentsLimit = 30;

  static create = async (localId, body, forumId, profileId) => {
    if (!Validate.body(body)) return sRes(this.codes.BAD_BODY, { body });

    if (!Validate.localId(localId))
      return sRes(this.codes.BAD_LOCALID, { localId });

    if (!Validate.id(forumId)) return sRes(serviceCodes.BAD_ID, { forumId });
    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });

    const t = await db.transaction();
    try {
      let comment = await ForumComment.create(
        {
          localId,
          body,
          forumId,
          profileId,
        },
        { transaction: t }
      );
      comment = comment.get({ plain: true });

      const [[_, updateResult]] = await Forum.increment(
        { comments: 1 },
        { where: { id: forumId }, transaction: t }
      );

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(
          serviceCodes.DB_ERR,
          { localId, body, forumId, profileId },
          err
        );
      }

      await t.commit();

      const profile = await Profile.findByPk(profileId);
      sendNotification({
        type: "FORUMID",
        id: forumId,
        data: {
          title: `${profile.username} commented on your post`,
          body: `${profile.username}: ${
            body.length > 50 ? body.slice(0, 50) + "..." : body
          }`,
        },
      });

      return sRes(serviceCodes.OK, { comment });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { body, forumId, profileId }, err);
    }
  };

  static update = async (values, commentId, forumId, profileId) => {
    const valuesToBeUpdated = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "localId":
          if (Validate.localId(val)) valuesToBeUpdated.localId = val;
          break;

        case "body":
          if (Validate.body(val)) valuesToBeUpdated.body = val;
          break;
      }
    }

    if (!Validate.id(forumId)) return sRes(serviceCodes.BAD_ID, { forumId });
    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });
    if (!Validate.id(commentId))
      return sRes(serviceCodes.BAD_ID, { commentId });

    const t = await db.transaction();

    try {
      const [updateResult] = await ForumComment.update(valuesToBeUpdated, {
        where: { profileId, forumId, id: commentId },
        transaction: t,
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(this.codes.BAD_ASSOCIATION, {
          body,
          forumId,
          profileId,
          commentId,
        });
      }

      let comment = await ForumComment.findByPk(commentId, { transaction: t });
      comment = comment.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { comment });
    } catch (err) {
      await t.rollback();
      return sRes(
        serviceCodes.DB_ERR,
        { body, forumId, profileId, commentId },
        err
      );
    }
  };

  static deleteOne = async (commentId, profileId) => {
    if (!Validate.id(commentId))
      return sRes(serviceCodes.BAD_ID, { commentId });
    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });

    const t = await db.transaction();

    try {
      let comment = await ForumComment.findByPk(commentId, { transaction: t });
      if (comment === null) {
        await t.rollback();
        return sRes(serviceCodes.BAD_ID, { commentId });
      }
      const forumId = comment.forumId;

      const destroyResult = await ForumComment.destroy({
        where: { id: commentId, forumId, profileId },
        transaction: t,
      });

      if (destroyResult !== 1) {
        await t.rollback();
        return sRes(this.codes.BAD_ASSOCIATION, {
          commentId,
          profileId,
          forumId,
        });
      }

      const [[_, updateResult]] = await Forum.decrement(
        { comments: 1 },
        { where: { id: forumId }, transaction: t }
      );

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(
          serviceCodes.DB_ERR,
          { commentId, forumId, profileId },
          err
        );
      }
      await t.commit();
      return sRes(serviceCodes.OK, { commentId, profileId, forumId });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { commentId, profileId }, err);
    }
  };

  static delete = async (commentIds, forumId, profileId) => {
    if (!Validate.id(forumId)) return sRes(serviceCodes.BAD_ID, { forumId });
    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });
    for (let commentId of commentIds)
      if (!Validate.id(commentId))
        return sRes(serviceCodes.BAD_ID, { commentId });

    const t = await db.transaction();

    try {
      const destroyResult = await ForumComment.destroy({
        where: { id: commentIds, forumId, profileId },
        transaction: t,
      });

      if (destroyResult !== 1) {
        await t.rollback();
        return sRes(this.codes.BAD_ASSOCIATION, {
          commentIds,
          profileId,
          forumId,
        });
      }

      const [[_, updateResult]] = await Forum.decrement(
        { comments: commentIds.length },
        { where: { id: forumId }, transaction: t }
      );

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(
          serviceCodes.DB_ERR,
          { commentIds, forumId, profileId },
          err
        );
      }

      await t.commit();
      return sRes(serviceCodes.OK, { commentIds, profileId, forumId });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { commentIds, forumId, profileId }, err);
    }
  };

  static getByTimestamp = async (timestamp, forumId, profileId = null) => {
    if (!Validate.id(forumId)) return sRes(serviceCodes.BAD_ID, { forumId });

    const whereObjTimestamp = {
      [timestampsKeys.createdAt]: { [Op.gt]: timestamp },
    };

    try {
      let comments = await ForumComment.findAll({
        where: { forumId, ...whereObjTimestamp },
        order: [[timestampsKeys.createdAt, "desc"]],
        include: [null, undefined].includes(profileId)
          ? [includeWriter]
          : [includeWriterWith(profileId, false, "writer")],
        limit: this.commentsLimit,
      });

      comments = comments.map((c) => {
        c = c.get({ plain: true });
        c.writer.isFollowing =
          Array.isArray(c.writer.follow) && c.writer.follow.length === 1;
        delete c.writer.follow;
        return c;
      });

      return sRes(serviceCodes.OK, { comments });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { timestamp, forumId }, err);
    }
  };

  static getByOffset = async (
    offset,
    values = {},
    orderFields = [[timestampsKeys.createdAt, "desc"]]
  ) => {
    const whereObj = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "localId":
          if (Validate.localId(val)) whereObj.localId = val;
          break;

        case "body":
          if (Validate.body(val)) whereObj.body = val;
          break;

        case "profileId":
          if (Validate.id(val)) whereObj.profileId = val;
          break;

        case "forumId":
          if (Validate.id(val)) whereObj.forumId = val;
          break;
      }
    }

    try {
      let comments = await ForumComment.findAll({
        where: { ...whereObj },
        offset,
        limit: this.commentsLimit,
        order: orderFields,
        include: [
          includeWriter,
          {
            model: Forum,
            as: "forum",
            attributes: {
              include: [["id", "forumId"]],
              exclude: ["id"],
            },
          },
        ],
      });
      comments = comments.map((f) => f.get({ plain: true }));

      return sRes(serviceCodes.OK, { comments });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset, values, orderFields }, err);
    }
  };

  static getPages = async () => {
    try {
      const totalCount = await ForumComment.count();
      const totalPages = Math.ceil(totalCount / this.commentsLimit);
      return sRes(serviceCodes.OK, { totalPages });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, null, err);
    }
  };
}

export const ForumComment_ = ForumCommentService;
