import { Router } from "express";
import logger from "../constants/logger.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";
import { usersLimitPerPage } from "../constants/pagination.js";
import CategoryService from "../services/category_service.js";
import NewsService from "../services/news_service.js";
import ForumsService from "../services/forums_service.js";
import UserService from "../services/user_service.js";
import ProfileService from "../services/profile_service.js";
import fs from "fs";
import { maxImageSizeFile } from "../env/env.config.js";

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
  const { status, result } = await UserService.getWAdminRights(req.query);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("Users found", result);

    case SERVICE_CODE.ERROR:
      logger.error("Users get failed", result, req.user, {
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.get("/users/pages", async (req, res) => {
  const { status, result } = await UserService.countAll();

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      const total = Math.ceil(result / usersLimitPerPage);
      return res.ok("Users count", { total });

    case SERVICE_CODE.ERROR:
      logger.error("Users count get failed", result, req.user);
      return res.serverError();
  }
});

router.delete("/users", async (req, res) => {
  const { status, result } = await UserService.deleteExistingWAdminRights(
    req.query
  );

  switch (status) {
    case SERVICE_CODE.DELETED:
      logger.info("User deleted by admin", req.user, { body: req.query.data });
      return res.ok("User deleted");

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Users deletion failed", result, req.user, {
        by: "admin",
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.post("/users", async (req, res) => {
  const { status, result } = await UserService.createNewWAdminRights(req.body);

  switch (status) {
    case SERVICE_CODE.CREATED:
      logger.info("User created by admin", req.user, result);
      return res.ok("User created", result);

    case SERVICE_CODE.REQ_FIELDS_MISSING:
      console.log(result);
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Users creation failed", result, req.user, {
        by: "admin",
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.get("/user", async (req, res) => {
  const { status, result } = await ProfileService.getByUserID(req.query);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("User found", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("User get failed", result, req.user, {
        by: "admin",
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.put("/user", async (req, res) => {
  const { status, result } = await ProfileService.updateExistingFull(
    req.body,
    true
  );

  switch (status) {
    case SERVICE_CODE.UPDATED:
      logger.info("Profile updated (by admin)", req.user, result);
      return res.ok("Profile updated", result);

    case SERVICE_CODE.REQ_FIELDS_MISSING:
    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
    case SERVICE_CODE.USERNAME_UNAVAILABLE:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Profile updation failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
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
      return res.ok("Forum updated", result);

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

router.put("/max-image-size", async (req, res) => {
  let size = req.body.get("size");
  try {
    size = Number(size);
    if (size > 0) fs.writeFileSync(maxImageSizeFile, String(size));
    else return res.failure("Invalid size");
    return res.ok("Max size updated", { size });
  } catch (err) {
    logger.error("Image max size change failed", err, req.user, { size });
    return res.serverError();
  }
});

router.get("/max-image-size", async (req, res) => {
  try {
    const size = Number(fs.readFileSync(maxImageSizeFile, "ascii"));
    return res.ok("Max Size", { size });
  } catch (err) {
    logger.error("Image max size get failed", err, req.user);
    return res.serverError();
  }
});

export const AdminRouter = router;
