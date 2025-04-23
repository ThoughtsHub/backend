import { Router } from "express";
import { haveProfile, loggedIn } from "../middlewares/auth/auth.js";
import logger from "../constants/logger.js";
import { validate as isUUID } from "uuid";
import ProfileService from "../services/profile_service.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";

const router = Router();

router.post("/", loggedIn, async (req, res) => {
  req.body.set("userId", req.user.id);
  const { status, result } = await ProfileService.createNew(req.body);

  switch (status) {
    case SERVICE_CODE.CREATED:
      logger.info("Profile created", req.user, result);
      return res.ok("Profile created", result);

    case SERVICE_CODE.USERNAME_UNAVAILABLE:
    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
    case SERVICE_CODE.REQ_FIELDS_MISSING:
    case SERVICE_CODE.PROPERTY_TYPE_INVALID:
      return res.failure(result);

    case SERVICE_CODE.PROFILE_ALREADY_EXISTS:
      logger.warning("Profile creation failed", req.user, {
        reason: "Profile already exists",
        body: req.body.data,
      });
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Profile creation failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.put("/", loggedIn, haveProfile, async (req, res) => {
  req.body.set("userId", req.user.id);
  req.body.set("profileId", req.user.Profile.id);
  const { status, result } = await ProfileService.updateExistingFull(req.body);

  switch (status) {
    case SERVICE_CODE.UPDATED:
      logger.info("Profile updated", req.user, result);
      return res.ok("Profile updated", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
    case SERVICE_CODE.REQ_FIELDS_MISSING:
    case SERVICE_CODE.PROPERTY_TYPE_INVALID:
    case SERVICE_CODE.USERNAME_UNAVAILABLE:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Profile updation failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.patch("/", async (req, res) => {
  req.body.set("userId", req.user.id);
  req.body.set("profileId", req.user.Profile.id);
  const { status, result } = await ProfileService.updateExistingPartial(
    req.body
  );

  switch (status) {
    case SERVICE_CODE.UPDATED:
      logger.info("Profile updated (partial)", req.user, result);
      return res.ok("Profile updated", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
    case SERVICE_CODE.PROPERTY_TYPE_INVALID:
    case SERVICE_CODE.USERNAME_UNAVAILABLE:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Profile updation failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

router.get("/", loggedIn, async (req, res) => {
  const { status, result } = await ProfileService.getByID(req.query);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("Profile found", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Profile get failed", result, req.user, {
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.get("/me", loggedIn, async (req, res) => {
  req.query.set("profileId", req.user.Profile.id);
  const { status, result } = await ProfileService.getByID(req.query);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("Profile found", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Profile get failed", result, req.user, {
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.get("/forums", loggedIn, async (req, res) => {
  if (!isUUID(req.query.get("profileId")))
    req.query.set("profileId", req.user?.Profile?.id);
  req.query.set("reqProfileId", req.user?.Profile?.id);
  const { status, result } = await ProfileService.getForumsByID(req.query);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("Profile forums found", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Profile forums get failed", result, req.user, {
        body: req.query.data,
      });
      return res.serverError();
  }
});

export const ProfileRouter = router;
