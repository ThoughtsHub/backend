import { Router } from "express";
import News from "../models/News.js";

const router = Router();

router.post("/news", async (req, res) => {
  const body = req.body;

  body.setFields("title body imageUrl category genre newsUrl");

  try {
    const news = await News.create(body.data);
    res.ok("News created", { news });
  } catch (err) {
    console.log(err);
    res.serverError();
  }
});

export const AdminRouter = router;
