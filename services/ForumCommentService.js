import db from "../db/pg.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";
import ForumComment from "../models/Forum_Comment.js";
import Forum from "../models/Forum.js";
import { isNumber } from "../utils/checks.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { includeWriter } from "../constants/include.js";
import { Op } from "sequelize";

const commentsLimit = 30;

class ForumCommentService {
  static create = async (localId, body, forumId, profileId) => {
    localId = localId ?? null;
    if (!Validate.body(body)) return sRes(codes.BAD_BODY, { body });

    if (!Validate.localId(localId)) return sRes(codes.BAD_LOCALID, { localId });

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
        return sRes(codes.BAD_ASSOCIATION, {
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
        return sRes(codes.BAD_ASSOCIATION, { commentId, profileId, forumId });
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
        return sRes(codes.BAD_ASSOCIATION, { commentIds, profileId, forumId });
      }

      const [_, updateResult] = await Forum.decrement(
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

  static getByTimestamp = async (timestamp, forumId) => {
    if (!isNumber(timestamp)) timestamp = 0;

    if (!Validate.id(forumId)) return sRes(serviceCodes.BAD_ID, { forumId });

    const whereObjTimestamp = {
      [timestampsKeys.createdAt]: { [Op.gt]: timestamp },
    };

    try {
      let comments = await ForumComment.findAll({
        where: { forumId, ...whereObjTimestamp },
        order: [[timestampsKeys.createdAt, "desc"]],
        include: [includeWriter],
        limit: commentsLimit,
      });

      comments = comments.map((c) => c.get({ plain: true }));

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
    if (!isNumber(offset)) offset = 0;

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
        limit: commentsLimit,
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
      const totalPages = Math.ceil(totalCount / commentsLimit);
      return sRes(serviceCodes.OK, { totalPages });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, null, err);
    }
  };
}

// Forum comment service response codes
export const codes = {
  BAD_BODY: "Bad Body",
  BAD_ASSOCIATION: "Bad Association",
  BAD_LOCALID: "Bad LocalId",
};

export const ForumComment_ = ForumCommentService;
