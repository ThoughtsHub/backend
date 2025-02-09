import Education from "../models/Education.js";
import getData from "../utils/request.js";

const allowedFields = [
  "school",
  "degree",
  "fieldOfStudy",
  "startMonth",
  "startYear",
  "endMonth",
  "endYear",
  "grade",
  "gradeType",
  "activitesAndSocieties",
  "description",
  "images",
];

const add = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data] = getData(req.body);

  try {
    const education = await Education.create(
      { ...data, profileId },
      { validate: true, fields: allowedFields }
    );

    res.created("Education added", { educationId: education.id });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const modify = async (req, res) => {
  const profileId = req.user.profile.id;

  const [data, id] = getData(req.body, ["educationId"]);

  if (id === null) return res.bad("No education Id");

  try {
    const [updateResult] = await Education.update(
      { ...data },
      {
        where: { profileId, id },
        transaction: t,
        validate: true,
        fields: allowedFields,
      }
    );

    if (updateResult !== 1) return res.bad("You have no education like that");

    res.created("Education updated");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const remove = async (req, res) => {
  const profileId = req.user.profile.id;

  const { id = null } = req.query;

  if (id === null) return res.noParams();

  try {
    const destroyResult = await Education.destroy({
      where: { id, profileId },
      individualHooks: true,
    });

    res.deleted();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const EducationHandler = { add, modify, del: remove };

export default EducationHandler;
