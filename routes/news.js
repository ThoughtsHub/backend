import { Router } from "express";
import News from "../models/News.js";
import { Op } from "sequelize";
import { timestampsKeys } from "../constants/timestamps.js";
import logger from "../constants/logger.js";

const newsLimitPerPage = 30;

const router = Router();

router.get("/", async (req, res) => {
  const body = req.query;

  const category = body.get("category", "All");
  const timestamp = body.get("timestamp", null);
  const whereObj = category === "All" ? {} : { category };

  try {
    let news;
    if (body.isNumber("timestamp"))
      news = await News.findAll({
        where: {
          ...whereObj,
          [timestampsKeys.createdAt]: { [Op.gte]: timestamp },
        },
        limit: 30,
        order: [[timestampsKeys.updatedAt, "DESC"]],
      });
    else
      news = await News.findAll({
        where: { ...whereObj },
        limit: 30,
        order: [[timestampsKeys.updatedAt, "DESC"]],
      });

    res.ok("News", { news });
    logger.info("news delivered", req.user, {
      body: body.data,
      timestamp,
      whereObj,
      news,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "news deliver failed",
      body: body.data,
      whereObj,
      timestamp,
    });

    res.serverError();
  }
});

// by offset
router.get("/bo", async (req, res) => {
  const body = req.query;

  const offset = body.toNumber("offset");
  const category = body.get("category", "All");

  try {
    const news = await News.findAll({
      where: category === "All" ? {} : { category },
      offset: offset * newsLimitPerPage,
      limit: newsLimitPerPage,
      order: [[timestampsKeys.updatedAt, "DESC"]],
    });

    res.ok("News", { news, newOffset: offset + news.length });
    logger.info("News delivered", req.user, { body: body.data, news });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "News deliver failed",
      body: body.data,
    });

    res.serverError();
  }
});

// get count of total news pages
router.get("/pages", async (req, res) => {
  const body = req.query;
  const category = body.get("category", "All");

  try {
    const newsCount = await News.count({
      where: category === "All" ? {} : { category },
    });

    const pages = Math.ceil(newsCount / newsLimitPerPage);

    res.ok("News Count", { total: pages });
    logger.info("News count delivered", req.user, {
      body: body.data,
      total: pages,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "News count deliver failed",
      body: body.data,
    });

    res.serverError();
  }
});

export const NewsRouter = router;
