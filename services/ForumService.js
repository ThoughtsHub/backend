import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";
import Forum from "../models/Forum.js";
import db, { randomOrder } from "../db/pg.js";
import Profile from "../models/Profile.js";
import ForumAppreciation from "../models/Forum_Appreciation.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { Op } from "sequelize";
import { includeAppreciation, includeWriter } from "../constants/include.js";
import notify from "./NotificationService.js";

class ForumService {
  // Forum service response codes
  static codes = {
    BAD_LOCALID: ["Bad LocalId", "Invalid localId, should be a string"],
    BAD_TITLE: ["Bad Title", "Forum title should at least contain one letter"],
    BAD_BODY: ["Bad Body", "Forum body should at least contain one letter"],
    BAD_IURL: ["Bad Image Url", "Invalid url for an image"],
    BAD_ASSOCIATION: ["Bad Association", "Forum doesn't belong to you"],
  };

  static forumsLimit = 30;
  static forumAppreciationsLimit = 30;

  static create = async (localId, title, body, imageUrl = "", profileId) => {
    if (!Validate.localId(localId))
      return sRes(this.codes.BAD_LOCALID, { localId });

    if (!Validate.title(title)) return sRes(this.codes.BAD_TITLE, { title });

    if (!Validate.body(body)) return sRes(this.codes.BAD_BODY, { body });

    if (!Validate.imageUrl(imageUrl))
      return sRes(this.codes.BAD_IURL, { imageUrl });

    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });

    const t = await db.transaction();
    try {
      let forum = await Forum.create(
        {
          localId,
          title,
          body,
          imageUrl,
          profileId,
        },
        { transaction: t }
      );
      forum = forum.get({ plain: true });

      let [[_, updateResult]] = await Profile.increment(
        { forums: 1 },
        { where: { id: profileId }, transaction: t }
      );

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, {
          localId,
          title,
          body,
          imageUrl,
          profileId,
        });
      }

      await t.commit();
      return sRes(serviceCodes.OK, { forum });
    } catch (err) {
      await t.rollback();
      return sRes(
        serviceCodes.DB_ERR,
        { localId, title, body, imageUrl, profileId },
        err
      );
    }
  };

  static update = async (values, profileId, forumId) => {
    const valuesToBeUpdated = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "localId":
          if (Validate.localId(val)) valuesToBeUpdated.localId = val;
          break;

        case "title":
          if (Validate.title(val)) valuesToBeUpdated.title = val;
          break;

        case "body":
          if (Validate.body(val)) valuesToBeUpdated.body = val;
          break;

        case "imageUrl":
          if (Validate.imageUrl(val)) valuesToBeUpdated.imageUrl = val;
          break;
      }
    }

    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });
    if (!Validate.id(forumId)) return sRes(serviceCodes.BAD_ID, { forumId });

    const t = await db.transaction();
    try {
      const [updateResult] = await Forum.update(valuesToBeUpdated, {
        where: { id: forumId, profileId },
        individualHooks: true,
        transaction: t,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(this.codes.BAD_ASSOCIATION, { values, profileId, forumId });
      }

      let forum = await Forum.findByPk(forumId, { transaction: t });
      forum = forum.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { forum });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { values, profileId, forumId }, err);
    }
  };

  static delete = async (forumIds, profileId) => {
    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });
    for (let forumId of forumIds)
      if (!Validate.id(forumId)) return sRes(serviceCodes.BAD_ID, { forumId });

    const t = await db.transaction();

    try {
      const destroyResult = await Forum.destroy({
        where: { id: forumIds, profileId },
        individualHooks: true,
        transaction: t,
      });

      if (destroyResult !== forumIds.length) {
        await t.rollback();
        return sRes(this.codes.BAD_ASSOCIATION, { forumIds, profileId });
      }

      const [[_, updateResult]] = await Profile.decrement(
        { forums: forumIds.length },
        { where: { id: profileId }, transaction: t }
      );

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { forumIds, profileId });
      }

      await t.commit();
      return sRes(serviceCodes.OK, { forumIds, profileId });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { forumIds, profileId }, err);
    }
  };

  static appreciations = async (
    offset,
    values = {},
    orderFields = [[timestampsKeys.createdAt, "desc"]]
  ) => {
    const whereObj = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "forumId":
          if (Validate.id(val)) whereObj.forumId = val;
          break;

        case "profileId":
          if (Validate.id(val)) whereObj.profileId = val;
          break;

        case "value":
          if (Validate.appreciationValue(val)) whereObj.value = val;
          break;
      }
    }

    try {
      let appreciations = await ForumAppreciation.findAll({
        where: { ...whereObj },
        offset,
        limit: this.forumAppreciationsLimit,
        order: orderFields,
        include: [
          { ...includeWriter, as: "profile" },
          {
            model: Forum,
            as: "forum",
            attributes: { include: [["id", "forumId"]], exclude: ["id"] },
          },
        ],
      });

      return sRes(serviceCodes.OK, { appreciations });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset, values, orderFields }, err);
    }
  };

  static appreciate = async (forumId, profileId) => {
    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });
    if (!Validate.id(forumId)) return sRes(serviceCodes.BAD_ID, { forumId });

    const t = await db.transaction();

    try {
      let updateResult = 1;
      let appreciation = await ForumAppreciation.findOne({
        where: { forumId, profileId },
        transaction: t,
      });
      let alreadyAppreciated = appreciation?.value === 1;
      if (appreciation === null)
        appreciation = await ForumAppreciation.create(
          {
            forumId,
            profileId,
            value: 1,
          },
          { transaction: t }
        );
      else
        [updateResult] = await ForumAppreciation.update(
          { value: 1 },
          { where: { forumId, profileId }, transaction: t }
        );

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { forumId, profileId });
      }

      if (!alreadyAppreciated) {
        let [[_, updateResult]] = await Forum.increment(
          { appreciations: 1 },
          { where: { id: forumId }, transaction: t }
        );

        if (updateResult !== 1) {
          await t.rollback();
          return sRes(serviceCodes.DB_ERR, { forumId, profileId });
        }
      }

      await notify.like(forumId, profileId, t);

      await t.commit();
      return sRes(serviceCodes.OK, { forumId, profileId });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { forumId, profileId }, err);
    }
  };

  static unappreciate = async (forumId, profileId) => {
    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });
    if (!Validate.id(forumId)) return sRes(serviceCodes.BAD_ID, { forumId });

    const t = await db.transaction();

    try {
      let updateResult = 1;
      let appreciation = await ForumAppreciation.findOne({
        where: { forumId, profileId },
        transaction: t,
      });
      let alreadyUnappreciated = appreciation?.value === 0;
      if (appreciation === null)
        appreciation = await ForumAppreciation.create(
          {
            forumId,
            profileId,
            value: 0,
          },
          { transaction: t }
        );
      else
        [updateResult] = await ForumAppreciation.update(
          { value: 0 },
          { where: { forumId, profileId }, transaction: t }
        );

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { forumId, profileId });
      }

      if (!alreadyUnappreciated) {
        let [[_, updateResult]] = await Forum.increment(
          { appreciations: -1 },
          { where: { id: forumId }, transaction: t }
        );

        if (updateResult !== 1) {
          await t.rollback();
          return sRes(serviceCodes.DB_ERR, { forumId, profileId });
        }
      }

      await notify.unlike(forumId, profileId, t);

      await t.commit();
      return sRes(serviceCodes.OK, { forumId, profileId });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { forumId, profileId }, err);
    }
  };

  static getByTimestamp = async (timestamp, profileId) => {
    if (!Validate.id(profileId) && ![null, undefined].includes(profileId))
      return sRes(serviceCodes.OK, { profileId });

    const whereObjTimestamp = {
      [timestampsKeys.createdAt]: { [Op.gt]: timestamp },
    };

    try {
      let offset = 0;
      {
        const forumsAfterTimestamp = await Forum.count({
          where: { ...whereObjTimestamp },
        });
        offset =
          forumsAfterTimestamp > 100
            ? 100
            : forumsAfterTimestamp - this.forumsLimit >= 0
            ? forumsAfterTimestamp - this.forumsLimit
            : 0;
      }

      let forums = await Forum.findAll({
        where: { ...whereObjTimestamp },
        limit: this.forumsLimit,
        offset,
        order: [[timestampsKeys.createdAt, "desc"]],
        include: [null, undefined].includes(profileId)
          ? [includeWriter]
          : [includeWriter, includeAppreciation(profileId)],
      });
      if (forums.length < this.forumsLimit) {
        let forumIds = forums.map((f) => f.id);
        let forums_ = await Forum.findAll({
          where: { id: { [Op.notIn]: forumIds } },
          order: randomOrder,
          limit: this.forumsLimit,
          include: [null, undefined].includes(profileId)
            ? [includeWriter]
            : [includeWriter, includeAppreciation(profileId)],
        });

        forums_ = forums_.slice(0, this.forumsLimit - forums.length - 1);
        forums = [...forums, ...forums_];
      }

      forums = forums.map((f) => {
        f = f.get({ plain: true });
        f.isVoted =
          Array.isArray(f.appreciations_) && f.appreciations_.length === 1;
        delete f.appreciations_;
        return f;
      });

      return sRes(serviceCodes.OK, { forums });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { profileId, timestamp }, err);
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

        case "title":
          if (Validate.title(val)) whereObj.title = val;
          break;

        case "body":
          if (Validate.body(val)) whereObj.body = val;
          break;

        case "imageUrl":
          if (Validate.imageUrl(val)) whereObj.imageUrl = val;
          break;

        case "profileId":
          if (Validate.id(val)) whereObj.profileId = val;
      }
    }

    try {
      let forums = await Forum.findAll({
        where: { ...whereObj },
        offset,
        limit: this.forumsLimit,
        order: orderFields,
        include: [includeWriter],
      });
      forums = forums.map((f) => f.get({ plain: true }));

      return sRes(serviceCodes.OK, { forums });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset, values, orderFields }, err);
    }
  };

  static getPages = async () => {
    try {
      const totalCount = await Forum.count();
      const totalPages = Math.ceil(totalCount / this.forumsLimit);
      return sRes(serviceCodes.OK, { totalPages });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, null, err);
    }
  };
}

export const Forum_ = ForumService;
