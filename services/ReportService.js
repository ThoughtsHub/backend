import { Validate } from "./ValidationService.js";
import { serviceCodes, sRes } from "../utils/services.js";
import ReportForum, { priority, status } from "../models/Report_Forum.js";
import db from "../db/pg.js";
import { timestampsKeys } from "../constants/timestamps.js";
import Forum from "../models/Forum.js";
import { includeReporter, includeWriter } from "../constants/include.js";

class ForumReportService {
  // Report service response codes
  static codes = {
    BAD_REASON: [
      "Bad Reason",
      "Invalid reason for a report, should be a string",
    ],
    BAD_PRIORITY: [
      "Bad Priority",
      `Priority for a report can only be from these: ${Object.values(
        priority
      ).join(", ")}`,
    ],
    BAD_STATUS: [
      "Bad Status",
      `Status for a report can only be from these: ${Object.values(status).join(
        ", "
      )}`,
    ],
    BAD_ASSOCIATION: ["Bad association", "This report was not filled by you"],
  };

  static reportsLimit = 30;

  static create = async (reason, priority, status, forumId, profileId) => {
    reason = reason ?? "No reason";
    if (!Validate.reason(reason))
      return sRes(this.codes.BAD_REASON, { reason });

    if (!Validate.priority(priority))
      return sRes(this.codes.BAD_PRIORITY, { priority });

    if (!Validate.forumReportStatus(status))
      return sRes(this.codes.BAD_STATUS, { status });

    if (!Validate.id(forumId)) return sRes(serviceCodes.BAD_ID, { forumId });
    if (!Validate.id(profileId))
      return sRes(serviceCodes.BAD_ID, { profileId });

    try {
      let report = await ReportForum.create({
        reason,
        priority,
        status,
        forumId,
        profileId,
      });
      report = report.get({ plain: true });

      return sRes(serviceCodes.OK, { report });
    } catch (err) {
      return sRes(
        serviceCodes.DB_ERR,
        { reason, priority, status, forumId, profileId },
        err
      );
    }
  };

  static update = async (values, reportId) => {
    const valuesToBeUpdated = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "reason":
          if (Validate.reason(val)) valuesToBeUpdated.reason = val;
          break;

        case "priority":
          if (Validate.priority(val)) valuesToBeUpdated.priority = val;
          break;

        case "status":
          if (Validate.forumReportStatus(val)) valuesToBeUpdated.status = val;
          break;
      }
    }

    if (!Validate.id(reportId)) return sRes(serviceCodes.BAD_ID, { reportId });

    const t = await db.transaction();

    try {
      const [updateResult] = await ReportForum.update(valuesToBeUpdated, {
        where: { id: reportId },
        transaction: t,
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(this.codes.BAD_ASSOCIATION, { values, reportId });
      }

      let report = await ReportForum.findByPk(reportId, { transaction: t });
      report = report.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { report });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { values, reportId }, err);
    }
  };

  static delete = async (reportIds) => {
    for (let reportId of reportIds)
      if (!Validate.id(reportId))
        return sRes(serviceCodes.BAD_ID, { reportId });

    const t = await db.transaction();

    try {
      const destroyResult = await ReportForum.destroy({
        where: { id: reportIds },
        transaction: t,
        individualHooks: true,
      });

      if (destroyResult !== reportIds.length) {
        await t.rollback();
        return sRes(serviceCodes.BAD_ID, { reportIds });
      }

      await t.commit();
      return sRes(serviceCodes.OK, { reportIds });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { reportIds }, err);
    }
  };

  static getByOffset = async (
    offset = 0,
    values = {},
    orderFields = [[timestampsKeys.createdAt, "desc"]]
  ) => {
    const whereObj = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "reason":
          whereObj.reason = val;
          break;

        case "priority":
          whereObj.priority = val;
          break;

        case "status":
          whereObj.status = val;
          break;

        case "profileId":
          whereObj.profileId = val;
          break;

        case "forumId":
          whereObj.forumId = val;
          break;
      }
    }

    try {
      let reports = await ReportForum.findAll({
        where: { ...whereObj },
        offset,
        limit: this.reportsLimit,
        order: orderFields,
        include: [
          {
            model: Forum,
            as: "forum",
            attributes: {
              include: [["id", "forumId"]],
              exclude: ["id"],
            },
            include: [includeWriter],
          },
          includeReporter,
        ],
      });
      reports = reports.map((r) => r.get({ plain: true }));

      return sRes(serviceCodes.OK, { reports });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset, values, orderFields }, err);
    }
  };

  static getPages = async () => {
    try {
      const totalCount = await ReportForum.count();
      const totalPages = Math.ceil(totalCount / this.reportsLimit);
      return sRes(serviceCodes.OK, { totalPages });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, null, err);
    }
  };
}

export const Report = {
  Forum_: ForumReportService,
};
