import { Router } from "express";
import auth from "../middlewares/auth.js";
import _req from "../utils/request.js";
import checks from "../utils/checks.js";
import School from "../models/School.js";

const router = Router();

const SCHOOL_FIELDS = [
  "schoolName",
  "studyCourse",
  "description",
  "startDate",
  "startYear",
  "endDate",
  "endYear",
];

router.post("/", auth.login, auth.profile, async (req, res) => {
  const profileId = req.user.profile.id;

  const schools = [];
  if (!Array.isArray(req.body.schools)) return res.noParams();

  try {
    for (const school of req.body.schools) {
      const data = _req.getDataO(school, SCHOOL_FIELDS);

      if (!checks.isNull(data.startDate)) data.startDate = Date(data.startDate);
      if (!checks.isNull(data.endDate)) data.endDate = Date(data.endDate);

      if (_req.anyNull(data.schoolName, data.studyCourse, data.startYear, data.endYear))
        return res.noParams();

      data.profileId = profileId; // add profile Id in the school
      schools.push(data);
    }

    const updateResult = await School.bulkCreate(schools, { validate: true });

    res.ok("School added", { schoolsAdded: schools.length });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const SchoolRouter = router;
