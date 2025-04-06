import { Router } from "express";
import News from "../models/News.js";
import logger from "../constants/logger.js";
import Category from "../models/Category.js";

const router = Router();

router.post("/categories", async (req, res) => {
  const body = req.body;

  body.setFields("name value");

  try {
    const category = await Category.create(body.data);
    res.ok("Category created", { category });
    logger.info("Category created", req.user, { body: body.data, category });
  } catch (err) {
    logger.error("category creation failed", err, req.user, {
      body: body.data,
    });

    res.serverError();
  }
});

router.delete("/categories", async (req, res) => {
  const id = req.query.get("id");

  try {
    const destroyResult = await Category.destroy({ where: { id } });
    res.ok("Deleted successfully");
    logger.info("Category deleted", req.user, {
      body: req.query.data,
      destroyResult,
    });
  } catch (err) {
    logger.error("category deletion failed", err, req.user, {
      body: req.query.data,
    });
    res.serverError();
  }
});

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
