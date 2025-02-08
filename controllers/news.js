import _env from "../constants/env.js";
import News from "../models/News.js";
import handle from "../utils/handle.js";
import getData from "../utils/request.js";
import c from "../utils/status_codes.js";

const getNews = async (req, res) => {
  const { offset = 0 } = req.query;

  try {
    const news = await News.findAll({
      attributes: { exclude: ["id"] },
      order: [["createdAt", "desc"]],
      offset,
      limit: 30,
    });

    res.status(c.OK).json({ message: "News", news });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const createNews = async (req, res) => {
  const [data] = getData(req.body, ["handle", "userId", "id"]);

  if (
    [data.title, data.content].includes(undefined) ||
    [data.title, data.content].includes(null)
  )
    return res
      .status(c.BAD_REQUEST)
      .json({ message: "Required info not given" });

  try {
    const newsHandle = handle.create(data.title);

    await News.create({ ...data, handle: newsHandle }, { validate: true });

    res.status(c.CREATED).json({ message: "News created" });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const updateNews = async (req, res) => {
  const [data, newsHandle] = getData(req.body, ["handle", "userId", "id"]);

  try {
    await News.update(
      { ...data },
      { where: { handle: newsHandle }, validate: true }
    );

    res.status(c.OK).json({ message: "News updated" });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const removeNews = async (req, res) => {
  const { handle = null } = req.query;

  if (handle === null)
    return res.status(c.BAD_REQUEST).json({ message: "No handle given" });

  try {
    const destroyResult = await News.destroy({
      where: { handle },
      individualHooks: true,
    });

    res.status(c.NO_CONTENT);
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const handler = {
  get: getNews,
  create: createNews,
  del: removeNews,
  update: updateNews,
};

export default handler;
