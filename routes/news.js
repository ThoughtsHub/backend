import { Router } from "express";
import News from "../models/News.js";
import { Op } from "sequelize";
import { timestampsKeys } from "../constants/timestamps.js";
import logger from "../constants/logger.js";
import NewsService from "../services/news_service.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";
import { newsLimitPerPage } from "../constants/pagination.js";

const router = Router();

router.get("/", async (req, res) => {
  const { status, result } = await NewsService.getByTimestamp(req.query);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      res.ok("News found", result);

    case SERVICE_CODE.NEWS_CATEGORY_INVALID:
      res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("News get failed", err, req.user, {
        type: "By Timestamp",
        body: req.query.data,
      });
      return res.serverError();
  }
});

// by offset
router.get("/bo", async (req, res) => {
  const { status, result } = await NewsService.getByOffset(req.query);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("News found", result);

    case SERVICE_CODE.NEWS_CATEGORY_INVALID:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("News get failed", err, req.user, {
        type: "By Offset",
        body: req.query.data,
      });
      return res.serverError();
  }
});

// get count of total news pages
router.get("/pages", async (req, res) => {
  const { status, result } = await NewsService.countAll(req.query);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      const total = Math.ceil(result / newsLimitPerPage);
      return res.ok("News count", { total });

    case SERVICE_CODE.NEWS_CATEGORY_INVALID:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("News count failed", err, req.user, {
        body: req.query.data,
      });
      return res.serverError();
  }
});

router.get("/:id", async (req, res) => {
  const { status, result } = await NewsService.getByID(req.params.id);

  switch (status) {
    case SERVICE_CODE.ACQUIRED:
      return res.ok("News found", result);

    case SERVICE_CODE.ID_INVALID:
      return res.failure(result);

    case SERVICE_CODE.ERROR:
      logger.error("News get failed", err, req.user, {
        type: "By ID",
        id: req.params.id,
      });
      return res.serverError();
  }
});

export const NewsRouter = router;
