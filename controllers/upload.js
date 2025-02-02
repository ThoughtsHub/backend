import _env from "../constants/env.js";
import c from "../utils/status_codes.js";
import Upload from "../models/Upload.js";
import { db } from "../db/connect.js";
import _file from "../utils/file.js";
import attr from "../constants/db.js";

const UPLOAD_LIMIT = attr.upload.limit; // upload limits

const getUploadsHandler = async (req, res) => {
  const userId = req.user.id;
  const { offset: rawOffset = 0 } = req.query;

  try {
    const offset =
      typeof rawOffset === "string" ? parseInt(rawOffset) : rawOffset;

    const uploads = await Upload.findAll({
      where: { userId },
      offset,
      limit: UPLOAD_LIMIT,
      order: [["updatedAt", "DESC"]],
      attributes: { exclude: ["userId", "id"] },
    });

    res.status(c.OK).json({ message: "Your uploads", uploads });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const uploadHandler = async (req, res) => {
  const userId = req.user.id;
  const filename = req.file?.filename ?? null;
  if (filename === null) throw new Error("Filename is null, file not saved");

  const fileInfo = _file.info(filename);

  const { name = null } = req.body;

  const t = await db.transaction();
  try {
    const file = await Upload.create(
      {
        name: name ?? fileInfo.name,
        handle: fileInfo.name,
        ext: fileInfo.ext,
        userId,
      },
      { transaction: t }
    );

    const fileDetails = {
      handle: file.handle,
      url: file?.url,
    };

    await t.commit();

    res.status(c.CREATED).json({
      message: "File uploaded",
      file: fileDetails,
    });
  } catch (err) {
    await t.rollback();
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const updateUploadHandler = async (req, res) => {
  const userId = req.user.id;
  const { name = null, handle = null } = req.body;

  if (name === null || handle === null)
    return res
      .status(c.BAD_REQUEST)
      .json({ message: "Required parameters not given" });

  try {
    const isFileUsers = await Upload.findOne({ handle, userId });
    if (isFileUsers === null)
      return res
        .status(c.FORBIDDEN)
        .json({ message: "You don't own this file" });

    const updateResult = await Upload.update(
      { name },
      { where: { userId, handle }, individualHooks: true }
    );

    res.status(c.OK).json({ message: "Updated" });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const deleteHandler = async (req, res) => {
  const userId = req.user.id;
  const { handle } = req.params;

  const file = _file.info(handle);

  const t = await db.transaction();
  try {
    const isFileUsers = await Upload.findOne({ handle: file.name, userId });
    if (isFileUsers === null)
      return res
        .status(c.FORBIDDEN)
        .json({ message: "You don't own this file" });

    const destoryResult = await Upload.destroy({
      where: { handle: file.name, userId },
      transaction: t,
      individualHooks: true,
    });

    res.sendStatus(c.NO_CONTENT);
  } catch (err) {
    await t.rollback();
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const handler = {
  upload: uploadHandler,
  getUploads: getUploadsHandler,
  patch: updateUploadHandler,
  delete: deleteHandler,
};

export default handler;
