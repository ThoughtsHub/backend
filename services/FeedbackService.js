import { includeWriter } from "../constants/include.js";
import { timestampsKeys } from "../constants/timestamps.js";
import db from "../db/pg.js";
import Feedback, { status } from "../models/Feedback.js";
import { isNumber } from "../utils/checks.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";

class FeedbackService {
  // Feedback service response codes
  static codes = {
    BAD_MESSAGE: [
      "Bad Message",
      "Invalid message for a feedback, should contain atleast one letter",
    ],
    BAD_STATUS: [
      "Bad Status",
      `Status can only be from these values: ${Object.values(status).join(
        ", "
      )}`,
    ],
  };

  static feedbacksLimit = 30;

  static create = async (message, status, profileId) => {
    if (!Validate.message(message))
      return sRes(this.codes.BAD_MESSAGE, { message });

    if (!Validate.id(profileId) && ![null, undefined].includes(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });

    if (!Validate.feedbackStatus(status))
      return sRes(this.codes.BAD_STATUS, { status });

    try {
      let feedback = await Feedback.create({
        message,
        status,
        profileId: profileId ?? null,
      });
      feedback = feedback.get({ plain: true });

      return sRes(serviceCodes.OK, { feedback });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { message, profileId }, err);
    }
  };

  static update = async (values, feedbackId) => {
    const valuesToBeUpdated = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "message":
          if (Validate.message(val)) valuesToBeUpdated.message = val;
          break;

        case "status":
          if (Validate.feedbackStatus(val)) valuesToBeUpdated.status = val;
          break;
      }
    }

    const t = await db.transaction();

    try {
      const [updateResult] = await Feedback.update(valuesToBeUpdated, {
        where: { id: feedbackId },
        transaction: t,
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.BAD_ID, { feedbackId });
      }

      let feedback = await Feedback.findByPk(feedbackId, { transaction: t });
      feedback = feedback.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { feedback });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { values, feedbackId }, err);
    }
  };

  static delete = async (feedbackId) => {
    if (!Validate.id(feedbackId))
      return sRes(serviceCodes.BAD_ID, { feedbackId });

    const t = await db.transaction();

    try {
      const destroyResult = await Feedback.destroy({
        where: { id: feedbackId },
        transaction: t,
        individualHooks: true,
      });

      if (destroyResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.BAD_ID, { feedbackId });
      }

      await t.commit();
      return sRes(serviceCodes.OK, { feedbackId });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { feedbackId }, err);
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
        case "message":
          whereObj.message = val;
          break;

        case "status":
          whereObj.status = val;
          break;

        case "profileId":
          whereObj.profileId = val;
          break;
      }
    }

    try {
      let feedbacks = await Feedback.findAll({
        where: { ...whereObj },
        offset,
        limit: this.feedbacksLimit,
        order: orderFields,
        include: [includeWriter],
      });
      feedbacks = feedbacks.map((f) => f.get({ plain: true }));

      return sRes(serviceCodes.OK, { feedbacks });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset, orderFields, values }, err);
    }
  };

  static getPages = async () => {
    try {
      const totalCount = await Feedback.count();
      const totalPages = Math.ceil(totalCount / this.feedbacksLimit);
      return sRes(serviceCodes.OK, { totalPages });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, null, err);
    }
  };
}

export const Feedback_ = FeedbackService;
