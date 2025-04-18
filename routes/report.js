import { Router } from "express";
import logger from "../constants/logger.js";
import { haveProfile, loggedIn } from "../middlewares/auth/auth.js";
import ReportService from "../services/report_service.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";

const router = Router();

router.post("/forum", loggedIn, haveProfile, async (req, res) => {
  req.body.set("profileId", req.user?.Profile?.id);
  const { status, result } = await ReportService.createNew(req.body);

  switch (status) {
    case SERVICE_CODE.CREATED:
      logger.info("Report filled", req.user, result);
      return res.ok("Report filled", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
    case SERVICE_CODE.REQ_FIELDS_MISSING:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Report filling failed", result, req.user, {
        body: req.body.data,
      });
      return res.serverError();
  }
});

export const ReportRouter = router;
