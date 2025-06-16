import { timestampsKeys } from "../constants/timestamps.js";
import { fields as instituteFields } from "../data/loaded_data/loaded_data.js";
import Institute from "../models/Institute.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";

class InstituteService {
  static institutesLimit = 30;

  static getInstitutes = async (values, offset) => {
    const fields = [...instituteFields];

    const valuesToBeFilterOn = {};
    for (const key in values) {
      if (fields.includes(key)) {
        const val = values[key];
        if (Validate.instituteField(val)) valuesToBeFilterOn[key] = val;
      }
    }

    try {
      let institutes = await Institute.findAll({
        where: { ...valuesToBeFilterOn },
        limit: 30,
        offset,
        order: [[timestampsKeys.updatedAt, "desc"]],
        attributes: { exclude: ["id", "createDate", "updateDate"] },
      });
      institutes = institutes.map((i) => i.get({ plain: true }));

      return sRes(serviceCodes.OK, { institutes });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { values, offset }, err);
    }
  };

  static getInstitute = async (instituteAisheCode) => {
    try {
      let institute = await Institute.findOne({
        where: { aisheCode: instituteAisheCode },
        attributes: { exclude: ["id", "createDate", "updateDate"] },
      });
      institute = institute.get({ plain: true });

      return sRes(serviceCodes.OK, { institute });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { instituteAisheCode }, err);
    }
  };
}

export const Institute_ = InstituteService;
