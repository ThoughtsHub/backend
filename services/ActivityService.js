import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";
import Activity from "../models/Activity.js";
import { isNumber } from "../utils/checks.js";
import { timestampsKeys } from "../constants/timestamps.js";

const activitiesLimit = 45;

class ActivityService {
  static create = async (type, title, description = "") => {
    if (!Validate.title(type)) return sRes(codes.BAD_TYPE, { type });

    if (!Validate.title(title)) return sRes(codes.BAD_TITLE, { title });

    if (!Validate.responseDesc(description))
      return sRes(codes.BAD_DESC, { description });

    try {
      await Activity.create({ type, title, description });

      return sRes(serviceCodes.OK, null);
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { type, title, description }, err);
    }
  };

  static getByOffset = async (offset) => {
    if (!isNumber(offset)) offset = 0;

    try {
      let activities = await Activity.findAll({
        offset,
        limit: activitiesLimit,
        order: [[timestampsKeys.createdAt, "desc"]],
      });
      activities = activities.map((a) => a.get({ plain: true }));

      return sRes(serviceCodes.OK, { activities });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset }, err);
    }
  };
}

//  Activity service response codes
export const codes = {
  BAD_TYPE: "Bad Type",
  BAD_TITLE: "Bad Title",
  BAD_DESC: "Bad Description",
};

export const Activity_ = ActivityService;

const activity = Activity_.create;
export default activity;
