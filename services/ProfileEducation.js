import db from "../db/pg.js";
import Institute from "../models/Institute.js";
import ProfileEducation from "../models/ProfileEducation.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { Institute_ } from "./InstituteService.js";
import { Validate } from "./ValidationService.js";

class ProfileEducationService {
  // profile education service codes
  static codes = {
    BAD_INST: ["BAD INSTITUTE ID", "Institute does not exist in our database"],
    BAD_STYEAR: [
      "BAD START YEAR",
      "Start Year can be from 1998 - Current Year",
    ],
    BAD_MONTH: ["BAD MONTH", "Month should be in range 1-12 or null"],
    BAD_ENDYEAR: [
      "BAD END YEAR",
      "End Year can be from 1998 - Current Year or null",
    ],
    BAD_ISCOM: [
      "BAD IS COMPLETED",
      "Should be either true/false in isCompleted",
    ],
  };

  static get = async (profileId) => {
    try {
      let educations = await ProfileEducation.findAll({
        where: { profileId },
        attributes: { include: [["id", "educationId"]], exclude: ["id"] },
        include: [
          {
            model: Institute,
            as: "institute",
            attributes: { exclude: ["createDate", "updateDate"] },
          },
        ],
      });
      educations = educations.map((e) => e.get({ plain: true }));

      return sRes(serviceCodes.OK, { educations });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { profileId }, err);
    }
  };

  static add = async ({
    profileId,
    instituteId,
    startYear,
    startMonth,
    endYear,
    endMonth,
    isCompleted = false,
  }) => {
    if (!(await Institute_.exists(instituteId)))
      return sRes(this.codes.BAD_INST, { instituteId, profileId });
    if (!Validate.educationYear(startYear, true))
      return sRes(this.codes.BAD_STYEAR, { startYear, profileId });
    if (
      !Validate.educationMonth(startMonth) ||
      !Validate.educationMonth(endMonth)
    )
      return sRes(this.codes.BAD_MONTH, {
        startMonth,
        endMonth,
        instituteId,
        profileId,
      });
    if (!Validate.educationYear(endYear))
      return sRes(this.codes.BAD_ENDYEAR, { endYear, profileId });
    if (![true, false].includes(isCompleted))
      return sRes(this.codes.BAD_ISCOM, {
        isCompleted,
        profileId,
        instituteId,
      });

    try {
      let education = await ProfileEducation.create({
        profileId,
        instituteId,
        startYear,
        endYear,
        startMonth,
        endMonth,
        isCompleted,
      });
      education = education.get({ plain: true });

      return sRes(serviceCodes.OK, { education });
    } catch (err) {
      return sRes(
        serviceCodes.DB_ERR,
        {
          profileId,
          instituteId,
          startYear,
          endYear,
          startMonth,
          endMonth,
          isCompleted,
        },
        err
      );
    }
  };

  static update = async (values, educationId, profileId) => {
    const valuesToBeUpdated = {};
    for (const key in values) {
      const val = values[key];
      switch (key) {
        case "startYear":
          if (Validate.educationYear(val)) valuesToBeUpdated.startYear = val;
          break;

        case "endYear":
          if (Validate.educationYear(val)) valuesToBeUpdated.endYear = val;
          break;

        case "startMonth":
          if (Validate.educationMonth(val)) valuesToBeUpdated.startMonth = val;
          break;

        case "endMonth":
          if (Validate.educationMonth(val)) valuesToBeUpdated.endMonth = val;
          break;

        case "isCompleted":
          if (![true, false].includes(val)) valuesToBeUpdated.isCompleted = val;
          break;

        case "instituteId":
          if (await Institute_.exists(val)) valuesToBeUpdated.instituteId = val;
          break;
      }
    }

    const t = await db.transaction();

    try {
      let [updateResult] = await ProfileEducation.update(
        { ...valuesToBeUpdated },
        {
          where: { id: educationId, profileId },
          transaction: t,
          individualHooks: true,
        }
      );
      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { values, profileId, educationId });
      }

      let education = await ProfileEducation.findByPk(educationId, {
        transaction: t,
      });
      education = education.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { education });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { values, profileId, educationId }, err);
    }
  };

  static remove = async (educationId, profileId) => {
    const t = await db.transaction();

    try {
      const destroyResult = await ProfileEducation.destroy({
        where: { id: educationId, profileId },
        individualHooks: true,
        transaction: t,
      });
      if (destroyResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.DB_ERR, { educationId });
      }

      await t.commit();
      return sRes(serviceCodes.OK);
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { educationId }, err);
    }
  };
}

export const ProfileEducation_ = ProfileEducationService;
