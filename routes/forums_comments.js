import { Router } from "express";
import { haveProfile, loggedIn } from "../middlewares/auth/auth.js";
import logger from "../constants/logger.js";
import ForumsService from "../services/forums_service.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";

const router = Router();

router.post("/", loggedIn, haveProfile, async (req, res) => {
  req.body.set("profileId", req.user?.Profile?.id);
  const { status, result } = await ForumsService.createNewComment(req.body);

  switch (status) {
    case SERVICE_CODE.CREATED:
      logger.info("Comment created on forum", req.user, result);
      return res.ok("Commented", result);

    case SERVICE_CODE.ID_MISSING:
    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.REQ_FIELDS_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Comment on forum failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.put("/", loggedIn, haveProfile, async (req, res) => {
  req.body.set("profileId", req.user?.Profile?.id);
  const { status, result } = await ForumsService.updateExistingCommentFull(
    req.body
  );

  switch (status) {
    case SERVICE_CODE.UPDATED:
      logger.info("Comment updated", req.user, result);
      return res.ok("Comment updated", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
    case SERVICE_CODE.REQ_FIELDS_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Comment update failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.get("/", async (req, res) => {
  const { status, result } = await ForumsService.getCommentsByTimestamp(
    req.query
  );

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("Comments of forum", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Comments get failed", result, req.user, {
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.delete("/", async (req, res) => {
  req.query.set("profileId", req.user?.Profile?.id);
  const { status, result } = await ForumsService.deleteExistingComment(
    req.query
  );

  switch (status) {
    case SERVICE_CODE.DELETED:
      logger.info("Comment deleted", req.user, { body: req.query.data });
      return res.ok("Comment deleted");

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Comment deletion failed", result, req.user, {
        body: req.query.data,
      });
      return res.serverError();
  }
});

export const ForumCommentRouter = router;
