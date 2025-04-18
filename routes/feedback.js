import { Router } from "express";
import { haveProfile, loggedIn } from "../middlewares/auth/auth.js";
import FeedbackService from "../services/feedback_service.js";
import { SERVICE_CODE } from "../utils/service_status_codes";
import logger from "../constants/logger";

const router = Router();

router.post("/", loggedIn, haveProfile, async (req, res) => {
  req.body.set("profileId", req.user?.Profile?.id);
  const { status, result } = await FeedbackService.createNew(req.body);

  switch (status) {
    case SERVICE_CODE.CREATED:
      logger.info("Feedback created", req.user, result);
      return res.ok("Feedback created", result);

    case SERVICE_CODE.ERROR:
      logger.error("Feedback creation failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

export const FeedbackRouter = router;
