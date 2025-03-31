import { Router } from "express";
import News from "../models/News.js";
import { Op } from "sequelize";
import { timestampsKeys } from "../constants/timestamps.js";
import logger from "../constants/logger.js";

const router = Router();

router.get("/", async (req, res) => {
  const body = req.query;

  const category = body.get("category", "all");
  const timestamp = body.get("timestamp", null);
  const whereObj = category === "all" ? {} : { category };

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

export const NewsRouter = router;
