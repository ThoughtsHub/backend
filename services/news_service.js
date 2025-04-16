import { Op } from "sequelize";
import { newsLimitPerPage } from "../constants/pagination.js";
import { timestampsKeys } from "../constants/timestamps.js";
import db from "../db/pg.js";
import News from "../models/News.js";
import { parseFields } from "../utils/field_parser.js";
import { sResult } from "../utils/service_return.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";

const modelFields =
  "title* body* hindiTitle hindiBody newsUrl* imageUrl* category*";
const { fields, reqFields } = parseFields(modelFields);

class NewsService {
  static createNew = async (body) => {
    body.setFields(fields);

    const reqFieldsNotGiven = body.anyNuldefined(reqFields);
    if (reqFieldsNotGiven.length !== 0)
      return sResult(
        SERVICE_CODE.REQ_FIELDS_MISSING,
        `Required: ${reqFieldsNotGiven}`
      );

    try {
      let news = await News.create(body.data);
      news = news.get({ plain: true });

      return sResult(SERVICE_CODE.CREATED, { news });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static updateExistingFull = async (body) => {
    const id = body.get("newsId");

    if (id === null) return sResult(SERVICE_CODE.ID_MISSING, "No Id provided");
    if (typeof id !== "string")
      return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");

    body.setFields(fields);

    const reqFieldsNotGiven = body.anyNuldefined(reqFields);
    if (reqFieldsNotGiven.length !== 0)
      return sResult(
        SERVICE_CODE.REQ_FIELDS_MISSING,
        `Required: ${reqFieldsNotGiven}`
      );

    const t = await db.transaction();
    try {
      const [updateResult] = await News.update(body.data, {
        where: { id },
        transaction: t,
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");
      }

      let updatedNews = await News.findByPk(id, { transaction: t });
      updatedNews = updatedNews.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.UPDATED, { news: updatedNews });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static deleteExisting = async (body) => {
    const id = body.get("newsId");

    if (id === null) return sResult(SERVICE_CODE.ID_MISSING, "No Id provided");
    if (typeof id !== "string")
      return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");

    const t = await db.transaction();
    try {
      const destoryResult = await News.destroy({
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

  static deleteAllExisting = async () => {
    try {
      const destoryResult = await News.destroy({ individualHooks: true });

      return sResult(SERVICE_CODE.DELETED, {
        NumberOfNewsDeleted: destoryResult,
      });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static countAll = async (body) => {
    const category = body.get("category", "All");

    if (typeof category !== "string")
      return sResult(SERVICE_CODE.NEWS_CATEGORY_INVALID, "Invalid category");

    try {
      const newsCount = await News.count({
        where: category === "All" ? {} : { category },
      });

      return sResult(SERVICE_CODE.ACQUIRED, newsCount);
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getByID = async (id) => {
    if (typeof id !== "string")
      return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");

    try {
      let news = await News.findByPk(id);
      news = news.get({ plain: true });
      return sResult(SERVICE_CODE.ACQUIRED, { news });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getByOffset = async (body) => {
    const offset = body.toNumber("offset");
    const category = body.get("category", "All");

    if (typeof category !== "string")
      return sResult(SERVICE_CODE.NEWS_CATEGORY_INVALID, "Invalid category");

    try {
      let news = await News.findAll({
        where: category === "All" ? {} : { category },
        offset: offset * newsLimitPerPage,
        limit: newsLimitPerPage,
        order: [[timestampsKeys.updatedAt, "DESC"]],
      });

      news = news.map((n) => n.get({ plain: true }));

      return sResult(SERVICE_CODE.ACQUIRED, {
        news,
        totalNews: news.length,
        newOffset: offset + news.length,
      });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static getByTimestamp = async (body) => {
    const category = body.get("category", "All");
    const timestamp = body.get("timestamp", null);

    if (typeof category !== "string")
      return sResult(SERVICE_CODE.NEWS_CATEGORY_INVALID, "Invalid category");

    try {
      let news = await News.findAll({
        where: {
          ...(category === "All" ? {} : { category }), // category
          ...(body.isNumber("timestamp")
            ? { [timestampsKeys.createdAt]: { [Op.gte]: timestamp } } // >= timestamp
            : {}),
        },
        limit: newsLimitPerPage,
        order: [[timestampsKeys.updatedAt, "DESC"]],
      });

      news = news.map((n) => n.get({ plain: true }));

      return sResult(SERVICE_CODE.ACQUIRED, { news });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };
}

export default NewsService;
