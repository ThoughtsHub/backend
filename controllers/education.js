import Education from "../models/Education.js";
import c from "../utils/status_codes.js";

const addEducation = async (req, res) => {
  const profileId = req.user.profile.id;

  const sentData = Object.fromEntries(
    Object.entries(req.body).filter(([_, value]) => value != null)
  );

  delete sentData.educationId;
  delete sentData.profileId;
  delete sentData.id;

  try {
    const education = await Education.create(
      { ...sentData, profileId },
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

  const sentData = Object.fromEntries(
    Object.entries(req.body).filter(([_, value]) => value != null)
  );

  const educationId = sentData.educationId ?? null;

  delete sentData.educationId;
  delete sentData.profileId;
  delete sentData.id;

  if (educationId === null)
    return res.status(c.BAD_REQUEST).json({ message: "No education Id" });

  try {
    const [updateResult] = await Education.update(
      { ...sentData },
      { where: { profileId, id: educationId }, transaction: t, validate: true }
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
      where: { id },
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
