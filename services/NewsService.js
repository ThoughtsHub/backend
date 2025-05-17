import News, { status } from "../models/News.js";
import { Validate } from "./ValidationService.js";
import { serviceCodes, sRes } from "../utils/services.js";
import Category from "../models/Category.js";
import db, { randomOrder } from "../db/pg.js";
import { isNumber } from "../utils/checks.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { Op } from "sequelize";

const newsLimit = 30;

class NewsService {
  static create = async (
    title,
    body,
    hindiTitle,
    hindiBody,
    imageUrl,
    newsUrl,
    category,
    status
  ) => {
    if (!Validate.title(title)) return sRes(codes.BAD_TITLE, { title });
    if (!Validate.title(hindiTitle))
      return sRes(codes.BAD_TITLE, { hindiTitle });

    if (!Validate.body(body)) return sRes(codes.BAD_BODY, { body });
    if (!Validate.body(hindiBody)) return sRes(codes.BAD_BODY, { hindiBody });

    if (!Validate.imageUrl(imageUrl)) return sRes(codes.BAD_IURL, { imageUrl });

    if (!Validate.newsUrl(newsUrl)) return sRes(codes.BAD_NURL, { newsUrl });

    if (!Validate.category(category))
      return sRes(codes.BAD_CATEGORY, { category });

    if (!Validate.newsStatus(status)) return sRes(codes.BAD_STATUS, { status });

    try {
      const category = await Category.findOne({ where: { name: category } });
      if (category === null) {
        return sRes(codes.INVALID_CATEGORY, { category });
      }

      let news = await News.create({
        title,
        body,
        hindiTitle,
        hindiBody,
        imageUrl,
        newsUrl,
        categoryId: category.id,
        status,
      });
      news = news.get({ plain: true });

      return sRes(serviceCodes.OK, { news });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, {
        title,
        body,
        hindiTitle,
        hindiBody,
        imageUrl,
        newsUrl,
        status,
        categoryId,
      });
    }
  };

  static update = async (values, newsId) => {
    if (!Validate.id(newsId)) return sRes(serviceCodes.BAD_ID, { newsId });

    const t = await db.transaction();

    try {
      const valuesToBeUpdated = {};
      for (const key in values) {
        const val = values[key];
        switch (key) {
          case "title":
            if (Validate.title(val)) valuesToBeUpdated.title = val;
            break;

          case "body":
            if (Validate.body(val)) valuesToBeUpdated.body = val;
            break;

          case "hindiTitle":
            if (Validate.title(val)) valuesToBeUpdated.hindiTitle = val;
            break;

          case "hindiBody":
            if (Validate.body(val)) valuesToBeUpdated.hindiBody = val;
            break;

          case "imageUrl":
            if (Validate.imageUrl(val)) valuesToBeUpdated.imageUrl = val;
            break;

          case "newsUrl":
            if (Validate.newsUrl(val)) valuesToBeUpdated.newsUrl = val;
            break;

          case "category":
            if (Validate.category(val)) {
              const category = await Category.findOne({ where: { name: val } });
              if (category === null)
                return sRes(codes.INVALID_CATEGORY, { values, newsId });
              valuesToBeUpdated.categoryId = category.id;
              break;
            }

          case "status":
            if (Validate.newsStatus(val)) valuesToBeUpdated.status = val;
            break;
        }
      }

      const [updateResult] = await News.update(valuesToBeUpdated, {
        where: { id: newsId },
        transaction: t,
        individualHooks: true,
      });

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { values, newsId });
      }

      let news = await News.findByPk(newsId, { transaction: t });
      news = news.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { values, newsId });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { values, newsId }, err);
    }
  };

  static delete = async (newsIds) => {
    for (let newsId of newsIds)
      if (!Validate.id(newsId)) return sRes(serviceCodes.BAD_ID, { newsId });

    const t = await db.transaction();

    try {
      const destroyResult = await News.destroy({
        where: { id: newsIds },
        transaction: t,
        individualHooks: true,
      });

      if (destroyResult !== newsIds.length) {
        await t.rollback();
        return sRes(serviceCodes.BAD_ID, { newsIds });
      }

      await t.commit();
      return sRes(serviceCodes.OK, { newsIds });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { newsIds }, err);
    }
  };

  static getByTimestamp = async (timestamp, categories = []) => {
    if (!isNumber(timestamp)) timestamp = 0;

    const categoryIds = [];
    for (const val of categories) {
      const category = await Category.findOne({
        where: { name: val },
      });
      if (category !== null) categoryIds.push(category.id);
    }

    const whereObjTimestamp = {
      [timestampsKeys.createdAt]: { [Op.gt]: timestamp },
      ...(categoryIds.length > 0 ? { categoryId: categoryIds } : {}),
    };

    try {
      let offset = 0;
      {
        const newsAfterTimestamp = await News.count({
          where: { ...whereObjTimestamp },
        });
        offset =
          newsAfterTimestamp > 100
            ? 100
            : newsAfterTimestamp - newsLimit >= 0
            ? newsAfterTimestamp - newsLimit
            : 0;
      }

      let news = await News.findAll({
        where: { ...whereObjTimestamp, status: status.Published },
        limit: newsLimit,
        offset,
        order: [[timestampsKeys.createdAt, "desc"]],
        include: [{ model: Category, as: "category" }],
      });
      if (news.length === 0) {
        news = await News.findAll({
          where: { status: status.Published },
          order: randomOrder,
          limit: newsLimit,
          include: [{ model: Category, as: "category" }],
        });

        news = news.map((f) => {
          f.get({ plain: true });
          f.category = f.category?.name ?? null;
          return f;
        });

        return sRes(serviceCodes.OK, { news });
      }
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { timestamp, categories }, err);
    }
  };

  static getByOffset = async (
    offset,
    values = {},
    orderFields = [[timestampsKeys.createdAt, "desc"]]
  ) => {
    if (!isNumber(offset)) offset = 0;

    try {
      const whereObj = {};
      for (const key in values) {
        const val = values[key];
        switch (key) {
          case "title":
            if (Validate.title(val)) whereObj.title = val;
            break;

          case "body":
            if (Validate.body(val)) whereObj.body = val;
            break;

          case "hindiTitle":
            if (Validate.title(val)) whereObj.hindiTitle = val;
            break;

          case "hindiBody":
            if (Validate.body(val)) whereObj.hindiBody = val;
            break;

          case "imageUrl":
            if (Validate.imageUrl(val)) whereObj.imageUrl = val;
            break;

          case "newsUrl":
            if (Validate.newsUrl(val)) whereObj.newsUrl = val;
            break;

          case "categories":
            const categoriesIds = [];
            for (let val_ of val) {
              if (Validate.category(val_)) {
                const category = await Category.findOne({
                  where: { name: val_ },
                });
                if (category === null)
                  return sRes(codes.INVALID_CATEGORY, {
                    values,
                    orderFields,
                    offset,
                  });
                categoriesIds.push(category.id);
              }
            }
            whereObj.categoriesId = categoriesIds;
            break;

          case "status":
            if (Validate.newsStatus(val)) whereObj.status = val;
            break;
        }
      }

      let news = await News.findAll({
        where: { ...whereObj },
        offset,
        limit: newsLimit,
        order: orderFields,
        include: [{ model: Category, as: "category" }],
      });
      news = news.map((n) => {
        n = n.get({ plain: true });
        n.category = n.category?.name ?? null;
        return n;
      });

      return sRes(serviceCodes.OK, { news });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset, values, orderFields }, err);
    }
  };

  static getPages = async () => {
    try {
      const totalCount = await News.count();
      const totalPages = Math.ceil(totalCount / newsLimit);
      return sRes(serviceCodes.OK, { totalPages });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, null, err);
    }
  };
}

// News service response codes
export const codes = {
  BAD_TITLE: "Bad Title",
  BAD_BODY: "Bad Body",
  BAD_IURL: "Bad Image Url",
  BAD_NURL: "Bad News Url",
  BAD_STATUS: "Bad Status",
  BAD_CATEGORY: "Bad Category",
  INVALID_CATEGORY: "Invalid Category",
};

export const News_ = NewsService;
