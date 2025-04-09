import { Router } from "express";
import News from "../models/News.js";
import logger from "../constants/logger.js";
import Category from "../models/Category.js";
import Forum from "../models/Forums.js";
import User from "../models/User.js";
import { timestampsKeys } from "../constants/timestamps.js";
import Profile from "../models/Profile.js";
import db from "../db/pg.js";

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

router.delete("/users", async (req, res) => {
  const userId = req.query.get("userId");

  try {
    const destroyResults = await User.destroy({ where: { id: userId } });

    res.ok("Deleted User", { numbers: destroyResults, userId });
    logger.info("Deleted user", req.user, { destroyResults, userId });
  } catch (err) {
    res.serverError();
    logger.error("Deletion of user failed", err, req.user, { userId });
  }
});

router.post("/users", async (req, res) => {
  const body = req.body;

  body.setFields("username password fullName about gender profileImageUrl");

  const reqFields = body.anyNuldefined("username password fullName about", ",");
  if (reqFields.length !== 0) return res.failure(`Required : ${reqFields}`);

  const [username, password, fullName, about, gender, profileImageUrl] =
    body.bulkGet("username password fullName about gender profileImageUrl");

  const t = await db.transaction();
  try {
    const user = await User.create({ username, password }, { transaction: t });
    const profile = await Profile.create(
      { fullName, about, gender, username, profileImageUrl, userId: user.id },
      { transaction: t }
    );

    res.ok("User created");
    await t.commit();
    logger.info("User created", req.user, { body: body.data, user, profile });
  } catch (err) {
    await t.rollback();
    res.serverError();
    logger.error("User creation failed", err, req.user, { body: body.data });
  }
});

router.get("/user", async (req, res) => {
  const userId = req.query.get("userId");

  try {
    const profile = await Profile.findOne({ where: { userId } });
    if (profile !== null) {
      logger.info("Profile delivered", req.user, { userId, profile });
      return res.ok("Profile found", { user: profile });
    }

    res.failure("No profile found with the given userId");
    logger.warning("Profile get failure", req.user, { userId });
  } catch (err) {
    res.serverError();
    logger.error("Profile delivery failed", err, req.user, { userId });
  }
});

router.put("/user", async (req, res) => {
  const body = req.body;

  body.setFields("fullName about gender profileImageUrl userId");
  const [userId, fullName, about, gender, profileImageUrl] = body.bulkGet(
    "userId fullName about gender profileImageUrl"
  );

  try {
    const profile = await Profile.findOne({ where: { userId } });

    if (profile === null) {
      const user = await User.findByPk(userId);
      await Profile.create({
        fullName,
        username: user.username,
        about,
        gender,
        profileImageUrl,
        userId,
      });
    } else {
      await Profile.update(
        { fullName, about, gender, profileImageUrl },
        { where: { id: profile.id, userId }, individualHooks: true }
      );
    }

    res.ok("Profile Updated");
    logger.info("Profile Updated", req.user, { body: body.data, profile });
  } catch (err) {
    res.serverError();
    logger.error("Profile update failed", err, req.user, { body: body.data });
  }
});

router.put("/forums", async (req, res) => {
  const body = req.body;

  body.setFields("title body forumId");
  const { title, body: body_, forumId } = body.bulkGetMap("title body forumId");

  try {
    const forumUpdate = await Forum.update(
      { title, body: body_ },
      { where: { id: forumId }, individualHooks: true }
    );

    res.ok("Forum Updated");
    logger.info("Forum Updated", req.user, { body: body.data, forumUpdate });
  } catch (err) {
    logger.error("Forum update failed", err, req.user, { body: body.data });
    res.serverError();
  }
});

router.put("/news", async (req, res) => {
  const body = req.body;

  body.setFields("title body imageUrl category genre newsUrl newsId");
  const newsId = body.get("newsId");
  body.del("newsId");

  try {
    const newsUpdate = await News.update(body.data, {
      where: { id: newsId },
      individualHooks: true,
    });

    res.ok("News Updated");
    logger.info("News updated", req.user, {
      body: body.data,
      newsId,
      newsUpdate,
    });
  } catch (err) {
    logger.error("News update failed", err, req.user, { body: body.data });
    res.serverError();
  }
});

export const AdminRouter = router;
