import { Router } from "express";
import News from "../models/News.js";
import { BASE_URL } from "../constants/env";
import auth from "../middlewares/auth";
import _req from "../utils/request.js";
import handle from "../utils/handle.js";

const router = Router();

const NEWS_FIELDS = [
  "title",
  "description",
  "images",
  "tags",
  "category",
  "image",
];

router.get("/", async (req, res) => {
  const { offset = 0 } = req.query;

  try {
    let news = await News.findAll({
      attributes: { exclude: ["id"] },
      offset,
      limit: 30,
      order: [["createdAt", "desc"]],
    });

    news = {
      ...news.get({ plain: true }),
      shareUrl: `${BASE_URL}/news/h/${news.handle}`,
      images: news.images[0],
    };
    res.ok("News", { news });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

router.post("/", auth.login, auth.admin, async (req, res) => {
  const { title, description, image, images, tags, category } = _req.getDataO(
    req.body,
    NEWS_FIELDS
  );

  if (typeof image === "string") images = [image];

  if (!Array.isArray(images)) return res.bad("No image given");

  if (_req.anyNull(title, description, images)) return res.noParams();

  const newsHandle = handle.create(title);

  try {
    const news = await News.create({
      title,
      description,
      images,
      tags,
      category,
      handle: newsHandle,
    });

    res.created("News Created", { news });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

router.put("/", auth.login, auth.admin, async (req, res) => {
  const { title, description, image, images, tags, category, id } =
    _req.getDataO(req.body, [...NEWS_FIELDS, "id"]);

  if (typeof image === "string") images = [image];

  if (!Array.isArray(images)) return res.bad("No image given");

  if (_req.anyNull(title, description, images, id)) return res.noParams();

  try {
    const [updated] = await News.update(
      { title, description, images, tags, category },
      { where: { id }, individualHooks: true }
    );

    if (updated !== 1) return res.bad("Invalid news id");

    const news = await News.findOne({ where: { id } });
    res.ok("News updated", { news });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

router.delete("/:handle", auth.login, auth.admin, async (req, res) => {
  const { handle = null } = req.params;

  if (handle === null) res.noParams();

  try {
    const destoryResult = await News.destroy({
      where: { handle },
      individualHooks: true,
    });

    if (destoryResult === 1) return res.ok("News Deleted");
    res.bad("Invalid news handle");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const NewsRouter = router;
