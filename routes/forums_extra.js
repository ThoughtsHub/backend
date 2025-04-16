import { Router } from "express";
import logger from "../constants/logger.js";
import { forumsLimitPerPage } from "../constants/pagination.js";
import ForumsService from "../services/forums_service.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";

const router = Router();

// by offset
router.get("/bo", async (req, res) => {
  req.query.set("profileId", req.user.Profile.id);
  req.query.set("userLoggedIn", req.loggedIn);
  const { status, result } = await ForumsService.getByOffset(req.query);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("Forum found", result);

    case SERVICE_CODE.ID_INVALID:
    case SERVICE_CODE.ID_MISSING:
    case SERVICE_CODE.PROPERTY_TYPE_INVALID:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Forum get failed", result, req.user, {
        type: "By Offset",
        body: req.query.data,
      });
      return res.serverError();
  }
});

// get count of total forums pages
router.get("/pages", async (req, res) => {
  const { status, result } = await ForumsService.countAll();

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      const totalPages = Math.ceil(result / forumsLimitPerPage);
      return res.ok("Forums count", { total: totalPages });

    case SERVICE_CODE.ERROR:
      logger.error("Forums count failed", result, req.user);
      return res.serverError();
  }
});

router.get("/:id", async (req, res) => {
  const { status, result } = await ForumsService.getByID(req.params.id);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("Forum found", result);

    case SERVICE_CODE.ID_INVALID:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("Forum get failed", err, req.user, {
        type: "By ID",
        id: req.params.id,
      });
      return res.serverError();
  }
});

export const ForumsExtra = router;
