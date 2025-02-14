import { Router } from "express";
import checks from "../utils/checks.js";
import auth from "../middlewares/auth.js";
import controller from "../controllers/controllers.js";

const router = Router();

router.post("/", controller.login.getUser, async (req, res) => {
  const { user, userId, profile, keyVal } = req.setParams;

  try {
    const sessionId = await auth.setup(userId, res, keyVal);

    res.ok("Login successfull", {
      sessionId,
      isUsernameSet: user.usernameSet,
      isfullNameSet: !checks.isNull(profile),
    });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const LoginRouter = router;
