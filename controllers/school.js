import School from "../models/School.js";
import ReqBody from "../utils/request.js";

const SCHOOL_FIELDS = [
  "collegeId",
  "degreeId",
  "fieldId",
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
 */
const createSchools = async (req, res) => {
  const profileId = req.user.profile.id;

  const body = req.body;
  body.setFields([...SCHOOL_FIELDS, "schools"]);

  const schools = [];
  if (body.fieldNotArray("schools")) return res.noParams();

  try {
    // put all the schools in an array by getting only the selected fixed fields
    for (const school of body.get("schools")) {
      const data = new ReqBody(school, SCHOOL_FIELDS);

      // set the dates to thier preffered datatypes
      const [startDate, endDate] = data.bulkGet("startDate endDate");
      if (!data.isNull("startDate")) data.set("startDate", Date(startDate));
      if (!data.isNull("endDate")) data.set("endDate", Date(endDate));

      if (data.anyFieldNull("schoolName studyCourse startYear endYear"))
        return res.noParams();

      data.set("profileId", profileId); // add profile Id in the school
      schools.push(data.values);
    }

    const updateResult = await School.bulkCreate(schools, { validate: true });

    res.ok("School added", { schoolsAdded: schools.length });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

export const SchoolController = { createSchools };
