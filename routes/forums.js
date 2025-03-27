import { Router } from "express";
import { timestampsKeys } from "../constants/timestamps.js";
import { Op } from "sequelize";
import Forum from "../models/Forums.js";
import { loggedIn } from "../middlewares/auth/auth.js";
import db from "../db/pg.js";

const router = Router();

router.post("/", loggedIn, async (req, res) => {
  const profileId = req.user.Profile.id;
  const body = req.body;

  body.setFields("title body localId imageUrl");

  const reqFields = body.anyNuldefined("title body", ",");
  if (reqFields.length !== 0) return res.failure(`Required: ${reqFields}`);

  const t = await db.transaction();
  try {
    const newForum = await Forum.create(
      { ...body.data, profileId },
      { transaction: t }
    );

    res.ok("Forum Created", { forum: newForum });
    await t.commit();
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.serverError();
  }
});

router.get("/", async (req, res) => {
  const timestamp = req.query.get("timestamp");

  const whereObj = req.query.isNumber(timestamp)
    ? { [timestampsKeys.createdAt]: { [Op.gte]: timestamp } }
    : {};

  try {
    const forums = await Forum.findAll({
      where: { ...whereObj },
      limit: 50,
      order: [[timestampsKeys.createdAt, "DESC"]],
    });

    res.ok("Forums", { forums });
  } catch (err) {
    console.log(err);
    res.serverError();
  }
});

export const ForumsRouter = router;
