import { Op } from "sequelize";
import {
  forumCommentsLimitPerPage,
  forumsLimitPerPage,
} from "../constants/pagination.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { includeWriter } from "../constants/writer.js";
import db from "../db/pg.js";
import Forum from "../models/Forums.js";
import ForumVote from "../models/ForumVote.js";
import { parseFields } from "../utils/field_parser.js";
import { sResult } from "../utils/service_return.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";
import ForumComment from "../models/ForumComment.js";
import {
  idInvalidOrMissing,
  reqFieldsNotGiven,
} from "../utils/service_checks.js";

const modelFields = "localId title* body*";
const { fields, reqFields } = parseFields(modelFields);

const voteModelFields = "value*";
const { fields: voteFields, reqFields: voteReqFields } =
  parseFields(voteModelFields);

const commentModelFields = "localId body*";
const { fields: commentFields, reqFields: commentReqFields } =
  parseFields(commentModelFields);

class ForumsService {
  static isOwner = async (forumId, profileId) => {
    const forumExists = await Forum.findOne({
      where: { id: forumId, profileId },
    });
    return forumExists !== null;
  };

  static createNew = async (body) => {
    const profileId = body.get("profileId");
    body.setFields(fields);

    let reqFieldsCheck = reqFieldsNotGiven(body, reqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;

    let idCheck = idInvalidOrMissing(profileId, "Profile");
    if (idCheck !== false) return idCheck;

    const t = await db.transaction();
    try {
      let forum = await Forum.create(
        { ...body.data, profileId },
        { transaction: t }
      );
      forum = forum.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.CREATED, { forum });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static updateExistingFull = async (body) => {
    const [id, profileId] = body.bulkGet("id profileId");
    body.setFields(fields);

    let reqFieldsCheck = reqFieldsNotGiven(body, reqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;

    let idCheck = idInvalidOrMissing(profileId, "Profile");
    if (idCheck !== false) return idCheck;
    idCheck = idInvalidOrMissing(id, "Forum");
    if (idCheck !== false) return idCheck;

    const forumBelongsToProfile = await this.isOwner(id, profileId);
    if (!forumBelongsToProfile)
      return sResult(
        SERVICE_CODE.ACCESS_INVALID,
        "Forum does not belong to user, this activity will be reported."
      );

    const t = await db.transaction();
    try {
      const [updateResult] = await Forum.update(body.data, {
        where: { id, profileId },
        transaction: t,
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");
      }

      let updatedForum = await Forum.findByPk(id, { transaction: t });
      updatedForum = updatedForum.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.UPDATED, { forum: updatedForum });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static updateExistingFullWAdminRights = async (body) => {
    const id = body.get("forumId");

    let idCheck = idInvalidOrMissing(id, "Forum");
    if (idCheck !== false) return idCheck;

    body.setFields(fields);

    let reqFieldsCheck = reqFieldsNotGiven(body, reqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;

    const t = await db.transaction();
    try {
      const [updateResult] = await Forum.update(body.data, {
        where: { id },
        transaction: t,
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");
      }

      let updatedForum = await Forum.findByPk(id, { transaction: t });
      updatedForum = updatedForum.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.UPDATED, { forum: updatedForum });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static deleteExisting = async (body) => {
    const [id, profileId] = body.bulkGet("forumId profileId");

    let idCheck = idInvalidOrMissing(profileId, "Profile");
    if (idCheck !== false) return idCheck;
    idCheck = idInvalidOrMissing(id, "Forum");
    if (idCheck !== false) return idCheck;

    const forumBelongsToProfile = await this.isOwner(id, profileId);
    if (!forumBelongsToProfile)
      return sResult(
        SERVICE_CODE.ACCESS_INVALID,
        "Forum does not belong to user, this activity will be reported."
      );

    const t = await db.transaction();
    try {
      const destroyResult = await Forum.destroy({
        where: { id, profileId },
        transaction: t,
        individualHooks: true,
      });

      if (destroyResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");
      }

      await t.commit();
      return sResult(SERVICE_CODE.DELETED);
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static deleteAllExisting = async () => {
    try {
      const destoryResult = await Forum.destroy({ individualHooks: true });

      return sResult(SERVICE_CODE.DELETED, {
        NumberOfForumsDeleted: destoryResult,
      });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static deleteExistingWAdminRights = async (body) => {
    const id = body.get("forumId");

    let idCheck = idInvalidOrMissing(id, "Forum");
    if (idCheck !== false) return idCheck;

    const t = await db.transaction();
    try {
      const destoryResult = await Forum.destroy({
        where: { id },
        transaction: t,
        individualHooks: true,
      });

      if (destoryResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");
      }

      await t.commit();
      return sResult(SERVICE_CODE.DELETED);
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static voteForum = async (body) => {
    const [forumId, profileId] = body.bulkGet("forumId profileId");
    body.setFields(voteFields);

    body.set("value", body.isTrue("value") ? 1 : 0);

    let reqFieldsCheck = reqFieldsNotGiven(body, voteReqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;

    let idCheck = idInvalidOrMissing(profileId, "Profile");
    if (idCheck !== false) return idCheck;
    idCheck = idInvalidOrMissing(forumId, "Forum");
    if (idCheck !== false) return idCheck;

    const t = await db.transaction();
    try {
      const voteExisting = await ForumVote.findOne({
        where: { forumId, profileId },
        transaction: t,
      });
      const votedAlready = voteExisting !== null;

      let vote;
      if (votedAlready) {
        const [updateResult] = await ForumVote.update(body.data, {
          where: { id: voteExisting.id },
          transaction: t,
          individualHooks: true,
        });

        if (updateResult !== 1) {
          await t.rollback();
          return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");
        }

        vote = await ForumVote.findByPk(voteExisting.id, { transaction: t });
      } else
        vote = await ForumVote.create({ ...body.data, forumId, profileId });

      vote = vote.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.VOTED, { vote });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static countAll = async () => {
    try {
      const forumsCount = await Forum.count();

      return sResult(SERVICE_CODE.ACQUIRED, forumsCount);
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getByID = async (id) => {
    let idCheck = idInvalidOrMissing(id, "Forum");
    if (idCheck !== false) return idCheck;

    try {
      let forum = await Forum.findByPk(id);
      forum = forum.get({ plain: true });

      return sResult(SERVICE_CODE.ACQUIRED, { forum });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getByOffset = async (body) => {
    const offset = body.toNumber("offset");
    const userLoggedIn = body.get("userLoggedIn", false);
    const profileId = body.get("profileId");

    let idCheck = idInvalidOrMissing(profileId, "Profile");
    if (idCheck !== false) return idCheck;

    if (typeof userLoggedIn !== "boolean")
      return sResult(
        SERVICE_CODE.PROPERTY_TYPE_INVALID,
        "Invalid type for loggedIn"
      );

    const includeVoteObj =
      userLoggedIn === true
        ? [
            {
              model: ForumVote,
              required: false,
              where: { profileId, value: 1 },
            },
          ]
        : [];

    try {
      let forums = await Forum.findAll({
        offset: offset * forumsLimitPerPage,
        limit: forumsLimitPerPage,
        order: [[timestampsKeys.updatedAt, "DESC"]],
        include: [includeWriter, ...includeVoteObj],
      });

      forums = forums.map((f) => {
        f = f.get({ plain: true });
        if (Array.isArray(f.ForumVotes) && f.ForumVotes.length === 1)
          f.isVoted = true;
        else f.isVoted = false;
        delete f.ForumVotes;
        return f;
      });

      return sResult(SERVICE_CODE.ACQUIRED, {
        forums,
        totalForums: forums.length,
        newOffset: offset + forums.length,
      });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getByTimestamp = async (body) => {
    const timestamp = body.get("timestamp", null);
    const userLoggedIn = body.get("userLoggedIn", false);
    const profileId = body.get("profileId");

    if (userLoggedIn === true) {
      let idCheck = idInvalidOrMissing(profileId, "Profile");
      if (idCheck !== false) return idCheck;
    }

    if (typeof userLoggedIn !== "boolean")
      return sResult(
        SERVICE_CODE.PROPERTY_TYPE_INVALID,
        "Invalid type for loggedIn"
      );

    const includeVoteObj =
      userLoggedIn === true
        ? [
            {
              model: ForumVote,
              required: false,
              where: { profileId, value: 1 },
            },
          ]
        : [];

    const whereObj = body.isNumber("timestamp")
      ? { [timestampsKeys.createdAt]: { [Op.gte]: timestamp } }
      : {};

    try {
      let forums = await Forum.findAll({
        where: { ...whereObj },
        limit: forumsLimitPerPage,
        order: [[timestampsKeys.createdAt, "DESC"]],
        include: [includeWriter, ...includeVoteObj],
      });

      forums = forums.map((f) => {
        f = f.get({ plain: true });
        if (Array.isArray(f.ForumVotes) && f.ForumVotes.length === 1)
          f.isVoted = true;
        else f.isVoted = false;
        delete f.ForumVotes;
        return f;
      });

      return sResult(SERVICE_CODE.ACQUIRED, {
        forums,
        totalForums: forums.length,
      });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static createNewComment = async (body) => {
    const [forumId, profileId] = body.bulkGet("forumId profileId");

    let idCheck = idInvalidOrMissing(profileId, "Profile");
    if (idCheck !== false) return idCheck;
    idCheck = idInvalidOrMissing(forumId, "Forum");
    if (idCheck !== false) return idCheck;

    body.setFields(commentFields);

    let reqFieldsCheck = reqFieldsNotGiven(body, commentReqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;

    const t = await db.transaction();
    try {
      const forum = await Forum.findByPk(forumId, { transaction: t });
      if (forum === null) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Forum Id Invalid");
      }

      let comment = await ForumComment.create(
        { ...body.data, profileId, forumId },
        { transaction: t }
      );

      comment = comment.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.CREATED, { comment });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static updateExistingCommentFull = async (body) => {
    const [forumId, id, profileId] = body.bulkGet(
      "forumId commentId profileId"
    );

    let idCheck = idInvalidOrMissing(profileId, "Profile");
    if (idCheck !== false) return idCheck;
    idCheck = idInvalidOrMissing(forumId, "Forum");
    if (idCheck !== false) return idCheck;
    idCheck = idInvalidOrMissing(id, "Comment");
    if (idCheck !== false) return idCheck;

    body.setFields(commentFields);

    let reqFieldsCheck = reqFieldsNotGiven(body, commentReqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;

    const t = await db.transaction();
    try {
      const comment = await ForumComment.findOne({
        where: { id, forumId, profileId },
        transaction: t,
      });
      if (comment === null) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid Comment Id");
      }

      const forum = await Forum.findByPk(forumId, { transaction: t });
      if (forum === null) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid Forum Id");
      }

      const [updateResult] = await ForumComment.update(body.data, {
        where: { id, profileId, forumId },
        transaction: t,
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid Comment Id");
      }

      let updatedComment = await ForumComment.findByPk(id, {
        transaction: t,
      });
      updatedComment = updatedComment.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.UPDATED, { comment: updatedComment });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static deleteExistingComment = async (body) => {
    const [id, profileId] = body.bulkGet("commentId profileId");

    let idCheck = idInvalidOrMissing(profileId, "Profile");
    if (idCheck !== false) return idCheck;
    idCheck = idInvalidOrMissing(id, "Comment");
    if (idCheck !== false) return idCheck;

    const t = await db.transaction();
    try {
      const comment = await ForumComment.findOne({
        where: { id, profileId },
        transaction: t,
      });
      if (comment === null) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid Comment Id");
      }

      const destroyResult = await ForumComment.destroy({
        where: { id },
        transaction: t,
        individualHooks: true,
      });

      if (destroyResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid comment Id");
      }

      await t.commit();
      return sResult(SERVICE_CODE.DELETED);
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getCommentsByTimestamp = async (body) => {
    const forumId = body.get("forumId");
    const timestamp = body.get("timestamp", null);

    let idCheck = idInvalidOrMissing(forumId, "Forum");
    if (idCheck !== false) return idCheck;

    const whereObj = body.isNumber("timestamp")
      ? { [timestampsKeys.createdAt]: { [Op.gte]: timestamp } }
      : {};

    try {
      let comments = await ForumComment.findAll({
        where: { forumId, ...whereObj },
        order: [[timestampsKeys.createdAt, "DESC"]],
        include: [includeWriter],
        limit: forumCommentsLimitPerPage,
      });

      comments = comments.map((c) => c.get({ plain: true }));

      return sResult(SERVICE_CODE.ACQUIRED, { comments });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };
}

export default ForumsService;
