import { Router } from "express";
import News from "../models/News.js";
import logger from "../constants/logger.js";

const router = Router();

router.post("/news", async (req, res) => {
  const body = req.body;

  body.setFields("title body imageUrl category genre newsUrl");

  try {
    const news = await News.create(body.data);
    res.ok("News created", { news });
    logger.info("news created", req.user, { body: body.data, news });
  } catch (err) {
    logger.error("news creation failed", err, req.user, { body: body.data });

    res.serverError();
  }
});

router.delete("/all/news", async (req, res) => {
  try {
    const destroyResults = await News.destroy({ where: {} });

    res.ok("Deleted All News", { numbers: destroyResults });
    logger.info("Deleted all news", req.user, { destroyResults });
  } catch (err) {
    console.log(err);
    res.serverError();
    logger.error("Deletion of all news failed", err, req.user);
  }
});

export const AdminRouter = router;
