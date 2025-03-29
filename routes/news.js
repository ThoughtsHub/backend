import { Router } from "express";
import News from "../models/News.js";
import { Op } from "sequelize";
import { timestampsKeys } from "../constants/timestamps.js";

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
  } catch (err) {
    logger.error(err);

    res.serverError();
  }
});

export const NewsRouter = router;
