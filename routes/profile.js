import { Router } from "express";
import { loggedIn } from "../middlewares/auth/auth.js";
import db from "../db/pg.js";
import User from "../models/User.js";
import { usernameNotAvailable } from "../utils/username.js";
import Profile from "../models/Profile.js";

const router = Router();

router.post("/", loggedIn, async (req, res) => {
  const body = req.body;

  body.setFields("fullName username profileImageUrl dob about");

  const requiredFields = body.anyNuldefined("fullName username about", ",");
  if (requiredFields.length !== 0)
    return res.failure(`Required : ${requiredFields}`);

  const transaction = await db.transaction();

  try {
    const username = body.get("username");
    if (await usernameNotAvailable(username))
      return failure("Username not avalilable");
    const [userUpdate] = await User.update(
      { username },
      { where: { id: req.userId }, transaction }
    );
    body.del("username");

    if (userUpdate !== 1) {
      await transaction.rollback();
      return res.failure("username could not be set, contact admin");
    }

    body.set("userId", req.userId);
    const profile = await Profile.create(body.data, { transaction });
    res.ok("Profile created", { user: profile });
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    console.log(err);
  }
});


export const ProfileRouter = router;
