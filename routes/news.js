import { Router } from "express";
import auth from "../middlewares/auth";
import controller from "../controllers/controllers";

const NewsController = controller.news;

const router = Router();

router.get("/", NewsController.getNews);

router.post("/", auth.login, auth.admin, NewsController.createNews);

router.put("/", auth.login, auth.admin, NewsController.updateNews);

router.delete("/:handle", auth.login, auth.admin, NewsController.deleteNews);

export const NewsRouter = router;
