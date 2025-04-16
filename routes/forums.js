import { Router } from "express";
import { haveProfile, loggedIn } from "../middlewares/auth/auth.js";
import { ForumCommentRouter } from "./forums_comments.js";
import logger from "../constants/logger.js";
import { ForumsExtra } from "./forums_extra.js";
import ForumsService from "../services/forums_service.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";

const router = Router();

router.post("/", loggedIn, haveProfile, async (req, res) => {
  req.body.set("profileId", req.user?.Profile?.id);
  const { status, result } = await ForumsService.createNew(req.body);

  switch (status) {
    case SERVICE_CODE.CREATED:
      logger.info("Forum created", req.user, result);
      return res.ok("Forum created", result);

    case SERVICE_CODE.REQ_FIELDS_MISSING:
    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Forum creation failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.put("/", loggedIn, haveProfile, async (req, res) => {
  req.body.set("profileId", req.user?.Profile?.id);
  const { status, result } = await ForumsService.updateExistingFull(req.body);

  switch (status) {
    case SERVICE_CODE.UPDATED:
      logger.info("Forum updated", req.user, result);
      return res.ok("Forum updated", result);

    case SERVICE_CODE.REQ_FIELDS_MISSING:
    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ACCESS_INVALID:
      return res.forbidden(result);

    case SERVICE_CODE.ERROR:
      logger.error("Forum updation failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.get("/", async (req, res) => {
  req.query.set("profileId", req.user?.Profile?.id);
  req.query.set("userLoggedIn", req.loggedIn);
  const { status, result } = await ForumsService.getByTimestamp(req.query);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("Forum found", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
    case SERVICE_CODE.PROPERTY_TYPE_INVALID:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Forum get failed", result, req.user, {
        type: "By Timestamp",
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.delete("/", async (req, res) => {
  req.query.set("profileId", req.user.Profile.id);
  const { status, result } = await ForumsService.updateExistingFull(req.query);

  switch (status) {
    case SERVICE_CODE.DELETED:
      logger.info("Forum deleted", req.user, { body: req.query.data });
      return res.ok("Forum deleted");

    case SERVICE_CODE.REQ_FIELDS_MISSING:
    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ACCESS_INVALID:
      return res.forbidden(result);

    case SERVICE_CODE.ERROR:
      logger.error("Forum deletion failed", result, req.user, {
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.post("/upvote", loggedIn, haveProfile, async (req, res) => {
  req.body.set("profileId", req.user.Profile.id);
  const { status, result } = await ForumsService.voteForum(req.body);

  switch (status) {
    case SERVICE_CODE.VOTED:
      logger.info("Forum voted", req.user, { body: req.body.data });
      return res.ok("Voted");

    case SERVICE_CODE.REQ_FIELDS_MISSING:
    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Forum voting failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.use("/comments", ForumCommentRouter);

router.use("/", ForumsExtra);

export const ForumsRouter = router;
