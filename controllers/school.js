import checks from "../utils/checks.js";
import School from "../models/School.js";
import ReqBody from "../utils/request.js";

const SCHOOL_FIELDS = [
  "schoolName",
  "studyCourse",
  "description",
  "startDate",
  "startYear",
  "endDate",
  "endYear",
];

/**
 * Adds the schools given as parameters
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const createSchools = async (req, res) => {
  const profileId = req.user.profile.id;

  const body = new ReqBody(req.body, [...SCHOOL_FIELDS, "schools"]);

  const schools = [];
  if (body.fieldNotArray("schools")) return res.noParams();

  try {
    for (const school of body.get("schools")) {
      const data = new ReqBody(school, SCHOOL_FIELDS);

      if (!data.isNull("startDate"))
        data.set("startDate", data.get("startDate"));
      if (!data.isNull("endDate")) data.set("endDate", data.get("endDate"));

      if (data.anyFieldNull("schoolName studyCourse startYear endYear"))
        return res.noParams();

      data.set("profileId", profileId); // add profile Id in the school
      schools.push(data);
    }

    const updateResult = await School.bulkCreate(schools, { validate: true });

    res.ok("School added", { schoolsAdded: schools.length });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

export const SchoolController = { createSchools };
