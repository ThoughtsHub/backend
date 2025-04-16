import { Router } from "express";
import logger from "../constants/logger.js";
import User from "../models/User.js";
import { timestampsKeys } from "../constants/timestamps.js";
import Profile from "../models/Profile.js";
import db from "../db/pg.js";
import CategoryService from "../services/category_service.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";
import NewsService from "../services/news_service.js";
import ForumsService from "../services/forums_service.js";

const usersLimitPerPage = 30;

const router = Router();

router.post("/categories", async (req, res) => {
  const { status, result } = await CategoryService.createNew(req.body);

  switch (status) {
    case SERVICE_CODE.CREATED:
      logger.info("New category created", req.user, result);
      return res.ok("Category created", result);

    case SERVICE_CODE.REQ_FIELDS_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Category creation failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.delete("/categories", async (req, res) => {
  const { status, result } = await CategoryService.deleteExisting(req.query);

  switch (status) {
    case SERVICE_CODE.DELETED:
      logger.info("Category deleted", req.user);
      return res.ok("Category deleted");

    case SERVICE_CODE.ID_INVALID:
      logger.warning("Category deletion failed", req.user, {
        reason: result,
        body: req.query.data,
      });
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Category deletion failed", result, req.user, {
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.post("/news", async (req, res) => {
  const { status, result } = await NewsService.createNew(req.body);

  switch (status) {
    case SERVICE_CODE.CREATED:
      logger.info("News created", req.user, result);
      return res.ok("News created", result);

    case SERVICE_CODE.REQ_FIELDS_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("News creation failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.delete("/all/news", async (req, res) => {
  const { status, result } = await NewsService.deleteAllExisting();

  switch (status) {
    case SERVICE_CODE.DELETED:
      logger.info("Deleted all news", req.user, result);
      return res.ok("Deleted all news", result);

    case SERVICE_CODE.ERROR:
      logger.error("News deletion failed", err, req.user, {
        event: "All news deletion",
      });
      return res.serverError();
  }
});

router.delete("/all/forums", async (req, res) => {
  const { status, result } = await ForumsService.deleteAllExisting();

  switch (status) {
    case SERVICE_CODE.DELETED:
      logger.info("Deleted all forums", req.user, result);
      return res.ok("Deleted all forums", result);

    case SERVICE_CODE.ERROR:
      logger.error("Forums deletion failed", err, req.user, {
        event: "All forums deletion",
      });
      return res.serverError();
  }
});

router.delete("/news", async (req, res) => {
  const { status, result } = await NewsService.deleteExisting(req.query);

  switch (status) {
    case SERVICE_CODE.DELETED:
      logger.info("News deleted", req.user, { body: req.query.data });
      return res.ok("News deleted");

    case SERVICE_CODE.ID_INVALID:
      logger.warning("News deletion failed", req.user, {
        reason: result,
        body: req.query.data,
      });
      return res.failure(result);

    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("News deletion failed", result, req.user, {
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.delete("/forums", async (req, res) => {
  const { status, result } = await ForumsService.deleteExistingWAdminRights(
    req.query
  );

  switch (status) {
    case SERVICE_CODE.DELETED:
      logger.info("Forum deleted", req.user, { body: req.query.data });
      return res.ok("Forum deleted");

    case SERVICE_CODE.ID_INVALID:
      logger.warning("Forum deletion failed", req.user, {
        reason: result,
        body: req.query.data,
      });
      return res.failure(result);

    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Forum deletion failed", result, req.user, {
        body: req.query.data,
      });
      return res.serverError();
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
  const { status, result } = await ForumsService.updateExistingFullWAdminRights(
    req.body
  );

  switch (status) {
    case SERVICE_CODE.UPDATED:
      logger.info("Forum updated", req.user, {
        body: req.body.data,
        ...result,
      });

    case SERVICE_CODE.ID_INVALID:
      logger.warning("Forum updation failed", req.user, {
        reason: result,
        body: req.query.data,
      });
      return res.failure(result);

    case SERVICE_CODE.REQ_FIELDS_MISSING:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Forum updation failed", result, req.user, {
        body: req.body.data,
      });
  }
});

router.put("/news", async (req, res) => {
  const { status, result } = await NewsService.updateExistingFull(req.body);

  switch (status) {
    case SERVICE_CODE.UPDATED:
      logger.info("News updated", req.user, { body: req.body.data, ...result });

    case SERVICE_CODE.ID_INVALID:
      logger.warning("News updation failed", req.user, {
        reason: result,
        body: req.query.data,
      });
      return res.failure(result);

    case SERVICE_CODE.REQ_FIELDS_MISSING:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("News updation failed", result, req.user, {
        body: req.body.data,
      });
  }
});

export const AdminRouter = router;
