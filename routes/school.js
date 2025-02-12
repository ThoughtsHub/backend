import { Router } from "express";
import Education from "../models/Education.js";

const allowedFields = [
  "schoolName",
  "description",
  "studyCourse",
  "startDate",
  "startYear",
  "endDateExpected",
  "endYear",
  "profileId",
];

const router = Router();

router.post("/", async (req, res) => {
  const profileId = req.user.profile.id;

  const { schools = null } = req.body;

  if (schools === null) return res.noParams();

  if (!Array.isArray(schools)) return res.bad("Schools should be an array");

  const _schools = [];
  for (const school of schools) {
    const newSchool = {};
    for (const field of allowedFields) {
      if (field === "profileId") continue;
      if (field === "startDate" || field === "endDateExpected") {
        newSchool[field] =
          school[field] !== undefined ? Date(school[field]) : null;
        continue;
      }
      newSchool[field] = school[field];
    }
    newSchool.profileId = profileId;
    _schools.push(newSchool);
  }

  try {
    await Education.bulkCreate(_schools, {
      validate: true,
      fields: allowedFields,
      individualHooks: true,
    });

    res.ok("Schools added");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const SchoolRouter = router;
