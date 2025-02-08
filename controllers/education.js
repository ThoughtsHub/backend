import Education from "../models/Education.js";
import getData from "../utils/request.js";
import c from "../utils/status_codes.js";

const addEducation = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data] = getData(req.body, ["educationId", "profileId", "id"]);

  try {
    const education = await Education.create(
      { ...data, profileId },
      { validate: true }
    );

    res
      .status(c.CREATED)
      .json({ message: "Education added", educationId: education.id });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const updateEducation = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data, id] = getData(req.body, ["educationId", "profileId", "id"]);

  if (id === null)
    return res.status(c.BAD_REQUEST).json({ message: "No education Id" });

  try {
    const [updateResult] = await Education.update(
      { ...data },
      { where: { profileId, id }, transaction: t, validate: true }
    );

    if (updateResult !== 1)
      return res
        .status(c.BAD_REQUEST)
        .json({ message: "You have no education like that" });

    res.status(c.CREATED).json({ message: "Education added" });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const removeEducation = async (req, res) => {
  const profileId = req.user.profile.id;

  const { id = null } = req.query;

  if (id === null)
    return res
      .status(c.BAD_REQUEST)
      .json({ message: "Required info not given" });

  try {
    const destroyResult = await Education.destroy({
      where: { id, profileId },
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
  add: addEducation,
  remove: removeEducation,
  update: updateEducation,
};

export default handler;
