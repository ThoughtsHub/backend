import { Router } from "express";
import News from "../models/News.js";
import logger from "../constants/logger.js";
import Category from "../models/Category.js";
import Forum from "../models/Forums.js";
import User from "../models/User.js";
import { timestampsKeys } from "../constants/timestamps.js";
import Profile from "../models/Profile.js";

const usersLimitPerPage = 30;

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

router.delete("/all/forums", async (req, res) => {
  try {
    const destroyResults = await Forum.destroy({ where: {} });

    res.ok("Deleted All Forums", { numbers: destroyResults });
    logger.info("Deleted all forums", req.user, { destroyResults });
  } catch (err) {
    console.log(err);
    res.serverError();
    logger.error("Deletion of all forums failed", err, req.user);
  }
});

router.delete("/news", async (req, res) => {
  const newsId = req.query.get("newsId");
  try {
    const destroyResults = await News.destroy({ where: { id: newsId } });

    res.ok("Deleted News", { numbers: destroyResults, newsId });
    logger.info("Deleted News", req.user, { destroyResults, newsId });
  } catch (err) {
    console.log(err);
    res.serverError();
    logger.error("Deletion of News failed", err, req.user, { newsId });
  }
});

router.delete("/forums", async (req, res) => {
  const forumId = req.query.get("forumId");
  try {
    const destroyResults = await Forum.destroy({ where: { id: forumId } });

    res.ok("Deleted Forums", { numbers: destroyResults, forumId });
    logger.info("Deleted forums", req.user, { destroyResults, forumId });
  } catch (err) {
    console.log(err);
    res.serverError();
    logger.error("Deletion of forums failed", err, req.user, { forumId });
  }
});

router.get("/users", async (req, res) => {
  const offset = req.query.toNumber("offset");

  try {
    const users = await User.findAll({
      offset: offset * usersLimitPerPage,
      limit: usersLimitPerPage,
      order: [[timestampsKeys.updatedAt, "DESC"]],
      include: [{ model: Profile }],
    });

    res.ok("Users", { users });
    logger.info("User delivered", req.user, { offset, users });
  } catch (err) {
    logger.error("User delivery failed", err, req.user, { offset });
    res.serverError();
  }
});

router.get("/users/pages", async (req, res) => {
  try {
    const pages = await User.count({ where: {} });

    const total = Math.ceil(pages / usersLimitPerPage);

    res.ok("Users", { total });
    logger.info("User delivered", req.user, { total });
  } catch (err) {
    logger.error("User delivery failed", err, req.user);
    res.serverError();
  }
});

export const AdminRouter = router;
