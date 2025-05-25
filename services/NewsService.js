import News, { status } from "../models/News.js";
import { Validate } from "./ValidationService.js";
import { serviceCodes, sRes } from "../utils/services.js";
import Category from "../models/Category.js";
import db, { randomOrder } from "../db/pg.js";
import { timestampsKeys } from "../constants/timestamps.js";
import { Op } from "sequelize";
import { isNull } from "../utils/checks.js";

class NewsService {
  // News service response codes
  static codes = {
    BAD_TITLE: [
      "Bad Title",
      "Invalid title for a news, at least contain a letter",
    ],
    BAD_BODY: [
      "Bad Body",
      "Invalid body for a news, at least contain a letter",
    ],
    BAD_IURL: ["Bad Image Url", "Invalid url"],
    BAD_NURL: ["Bad News Url", "Invalid url"],
    BAD_STATUS: [
      "Bad Status",
      `Status can only be from these values: ${Object.values(status).join(
        ", "
      )}`,
    ],
    BAD_CATEGORY: [
      "Bad Category",
      "Category should at least contain a letter in it",
    ],
    INVALID_CATEGORY: ["Invalid Category", "This category doesn't exist"],
  };

  static newsLimit = 30;

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
    if (!Validate.newsTitle(title))
      return sRes(this.codes.BAD_TITLE, { title });
    if (!Validate.newsTitle(hindiTitle))
      return sRes(this.codes.BAD_TITLE, { hindiTitle });

    if (!Validate.newsBody(body)) return sRes(this.codes.BAD_BODY, { body });
    if (!Validate.newsBody(hindiBody))
      return sRes(this.codes.BAD_BODY, { hindiBody });

    if (!Validate.imageUrl(imageUrl))
      return sRes(this.codes.BAD_IURL, { imageUrl });

    if (!Validate.newsUrl(newsUrl))
      return sRes(this.codes.BAD_NURL, { newsUrl });

    if (!Validate.category(category))
      return sRes(this.codes.BAD_CATEGORY, { category });

    if (!Validate.newsStatus(status))
      return sRes(this.codes.BAD_STATUS, { status });

    try {
      const category_ = await Category.findOne({ where: { name: category } });

      let news = await News.create({
        title,
        body,
        hindiTitle,
        hindiBody,
        imageUrl,
        newsUrl,
        categoryId: category_?.id,
        status,
      });
      news = news.get({ plain: true });

      return sRes(serviceCodes.OK, { news });
    } catch (err) {
      return sRes(
        serviceCodes.DB_ERR,
        {
          title,
          body,
          hindiTitle,
          hindiBody,
          imageUrl,
          newsUrl,
          status,
          category,
        },
        err
      );
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
            if (Validate.newsTitle(val) && !isNull(val))
              valuesToBeUpdated.title = val;
            break;

          case "body":
            if (Validate.newsBody(val) && !isNull(val))
              valuesToBeUpdated.body = val;
            break;

          case "hindiTitle":
            if (Validate.newsTitle(val) && !isNull(val))
              valuesToBeUpdated.hindiTitle = val;
            break;

          case "hindiBody":
            if (Validate.newsBody(val) && !isNull(val))
              valuesToBeUpdated.hindiBody = val;
            break;

          case "imageUrl":
            if (Validate.imageUrl(val) && !isNull(val))
              valuesToBeUpdated.imageUrl = val;
            break;

          case "newsUrl":
            if (Validate.newsUrl(val) && !isNull(val))
              valuesToBeUpdated.newsUrl = val;
            break;

          case "category":
            if (Validate.category(val) && !isNull(val)) {
              const category = await Category.findOne({ where: { name: val } });
              if (category === null) {
                await t.rollback();
                return sRes(this.codes.INVALID_CATEGORY, { values, newsId });
              }
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
      return sRes(serviceCodes.OK, { values, newsId, news });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { values, newsId }, err);
    }
  };

  static delete = async (newsIds) => {
    for (let newsId of newsIds)
      if (!Validate.id(newsId)) return sRes(serviceCodes.BAD_ID, { newsId });

    const t = await db.transaction();

    console.log(newsIds);

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
            : newsAfterTimestamp - this.newsLimit >= 0
            ? newsAfterTimestamp - this.newsLimit
            : 0;
      }

      let news = await News.findAll({
        where: { ...whereObjTimestamp, status: status.Published },
        limit: this.newsLimit,
        offset,
        order: [[timestampsKeys.createdAt, "desc"]],
        include: [{ model: Category, as: "category" }],
      });
      if (news.length === 0) {
        news = await News.findAll({
          where: { status: status.Published },
          order: randomOrder,
          limit: this.newsLimit,
          include: [{ model: Category, as: "category" }],
        });
      }

      news = news.map((f) => {
        f.get({ plain: true });
        f.category = f.category?.name ?? "no category";
        if (f.category === null) f.category = "no category";
        return f;
      });

      return sRes(serviceCodes.OK, { news });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { timestamp, categories }, err);
    }
  };

  static getByOffset = async (
    offset,
    values = {},
    orderFields = [[timestampsKeys.createdAt, "desc"]]
  ) => {
    const matchCaseTitle = values.matchCaseTitle === true;
    const matchCaseBody = values.matchCaseBody === true;
    try {
      let whereObj = {};
      if (values.all === "false")
        for (const key in values) {
          const val = values[key];
          switch (key) {
            case "title":
              if (Validate.newsTitle(val))
                whereObj.title = {
                  [matchCaseTitle ? Op.like : Op.iLike]: `%${val}%`,
                };
              break;

            case "body":
              if (Validate.newsBody(val))
                whereObj.body = {
                  [matchCaseBody ? Op.like : Op.iLike]: `%${val}%`,
                };
              break;

            case "hindiTitle":
              if (Validate.newsTitle(val))
                whereObj.hindiTitle = {
                  [matchCaseTitle ? Op.like : Op.iLike]: `%${val}%`,
                };
              break;

            case "hindiBody":
              if (Validate.newsBody(val))
                whereObj.hindiBody = {
                  [matchCaseBody ? Op.like : Op.iLike]: `%${val}%`,
                };
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
                    return sRes(this.codes.INVALID_CATEGORY, {
                      values,
                      orderFields,
                      offset,
                    });
                  categoriesIds.push(category.id);
                }
              }
              whereObj.categoryId = categoriesIds;
              break;

            case "status":
              if (Validate.newsStatus(val)) whereObj.status = val;
              break;
          }
        }

      console.log(whereObj);

      let news = await News.findAll({
        where: { ...whereObj },
        offset,
        limit: this.newsLimit,
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
      const totalPages = Math.ceil(totalCount / this.newsLimit);
      return sRes(serviceCodes.OK, { totalPages });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, null, err);
    }
  };
}

export const News_ = NewsService;
