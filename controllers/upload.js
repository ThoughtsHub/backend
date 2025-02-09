import _env from "../constants/env.js";
import Upload from "../models/Upload.js";
import { db } from "../db/connect.js";
import _file from "../utils/file.js";
import attr from "../constants/db.js";

const UPLOAD_LIMIT = attr.upload.limit; // upload limits

const getUploadsHandler = async (req, res) => {
  const userId = req.user.id;
  const { offset = 0 } = req.query;

  try {
    const uploads = await Upload.findAll({
      where: { userId },
      offset,
      limit: UPLOAD_LIMIT,
      order: [["updatedAt", "DESC"]],
      attributes: { exclude: ["userId", "id"] },
    });

    res.ok("Your uploads", { uploads });
  } catch (err) {
    console.log(err);

    res.serverError();
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

    res.created("File uploaded", { file: fileDetails });
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.serverError();
  }
};

const updateUploadHandler = async (req, res) => {
  const userId = req.user.id;
  const { name = null, handle = null } = req.body;

  if (name === null || handle === null) return res.noParams();

  try {
    const isFileUsers = await Upload.findOne({ handle, userId });
    if (isFileUsers === null) return res.forbidden("You don't own this file");

    const updateResult = await Upload.update(
      { name },
      { where: { userId, handle }, individualHooks: true }
    );

    res.ok("Updated");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const deleteHandler = async (req, res) => {
  const userId = req.user.id;
  const { handle } = req.params;

  const file = _file.info(handle);

  const t = await db.transaction();
  try {
    const isFileUsers = await Upload.findOne({ handle: file.name, userId });
    if (isFileUsers === null) return res.forbidden("You don't own this file");

    const destoryResult = await Upload.destroy({
      where: { handle: file.name, userId },
      transaction: t,
      individualHooks: true,
    });

    res.deleted();
  } catch (err) {
    await t.rollback();
    console.log(err);

    res.serverError();
  }
};

const handler = {
  upload: uploadHandler,
  getUploads: getUploadsHandler,
  patch: updateUploadHandler,
  delete: deleteHandler,
};

export default handler;
