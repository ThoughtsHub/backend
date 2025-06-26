import { Op } from "sequelize";
import { timestampsKeys } from "../constants/timestamps.js";
import { fields as instituteFields } from "../data/loaded_data/loaded_data.js";
import Institute from "../models/Institute.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";
import ProfileEducation from "../models/ProfileEducation.js";
import { includeProfile, includeWriterWith } from "../constants/include.js";

class InstituteService {
  static institutesLimit = 30;
  static usersLimit = 30;

  static exists = async (instituteId) => {
    try {
      const institue = await Institute.findByPk(instituteId);
      return institue !== null;
    } catch (err) {
      return false;
    }
  };

  static getInstitutes = async (values, offset) => {
    const fields = [...instituteFields];

    const whereObj = {};
    for (const key in values) {
      if (fields.includes(key)) {
        const val = values[key];
        switch (key) {
          case "name":
            if (Validate.instituteField(val))
              whereObj.name = { [Op.iLike]: `%${val}%` };
            break;

          case "aisheCode":
            if (Validate.instituteField(val)) whereObj.aisheCode = val;
            break;

          case "state":
            if (Validate.instituteField(val)) whereObj.state = val;
            break;

          case "category":
            if (Validate.instituteField(val)) whereObj.category = val;
            break;

          case "type":
            if (Validate.instituteField(val)) whereObj.type = val;
            break;

          case "district":
            if (Validate.instituteField(val)) whereObj.district = val;
            break;

          case "about":
            if (Validate.instituteField(val))
              whereObj.about = { [Op.iLike]: `%${val}%` };
            break;

          case "type":
            if (Validate.instituteField(val)) whereObj.type = val;
            break;

          case "management":
            if (Validate.instituteField(val)) whereObj.management = val;
            break;

          case "universityName":
            if (Validate.instituteField(val))
              whereObj.universityName = { [Op.iLike]: `%${val}%` };
            break;

          case "universityType":
            if (Validate.instituteField(val)) whereObj.universityType = val;

          case "administrativeMinistry":
            if (Validate.instituteField(val))
              whereObj.administrativeMinistry = val;
            break;

          case "website":
            if (Validate.instituteField(val))
              whereObj.website = { [Op.iLike]: `%${val}%` };
            break;

          case "location":
            if (Validate.instituteField(val))
              whereObj.location = { [Op.iLike]: `%${val}%` };
            break;

          case "yearOfEstablishment":
            if (Validate.instituteField(val))
              whereObj.yearOfEstablishment = val;
            break;
        }
      }
    }

    try {
      let institutes = await Institute.findAll({
        where: { ...whereObj },
        limit: 30,
        offset,
        order: [[timestampsKeys.updatedAt, "desc"]],
        attributes: {
          exclude: ["id", "createDate", "updateDate"],
          include: [["id", "instituteId"]],
        },
      });
      institutes = institutes.map((i) => i.get({ plain: true }));

      return sRes(serviceCodes.OK, { institutes });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { values, offset }, err);
    }
  };

  static getInstitute = async (instituteId) => {
    try {
      let institute = await Institute.findOne({
        where: { id: instituteId },
        attributes: {
          exclude: ["id", "createDate", "updateDate"],
          include: [["id", "instituteId"]],
        },
      });
      institute = institute.get({ plain: true });

      return sRes(serviceCodes.OK, { institute });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { instituteAisheCode }, err);
    }
  };

  static getUsers = async (instituteId, offset, profileId = null) => {
    try {
      let users = await ProfileEducation.findAll({
        where: { instituteId },
        offset,
        limit: this.usersLimit,
        include:
          profileId === null
            ? [includeProfile]
            : [includeWriterWith(profileId, false, "profile")],
      });

      users = users.map((u) => {
        u = u.get({ plain: true });
        u.profile.isFollowing =
          Array.isArray(u.profile.follow) && u.profile.follow.length === 1;
        delete u.profile.follow;
        return u.profile;
      });

      return sRes(serviceCodes.OK, { users });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { instituteId, offset }, err);
    }
  };
}

export const Institute_ = InstituteService;
