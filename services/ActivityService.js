import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";
import Activity from "../models/Activity.js";
import { timestampsKeys } from "../constants/timestamps.js";

class ActivityService {
  //  Activity service response codes
  static codes = {
    BAD_TYPE: ["Bad Type", "Activity status type does not meet qualifications"],
    BAD_TITLE: [
      "Bad Title",
      "Invalid title for an activity, should be a string and at least a letter",
    ],
    BAD_DESC: [
      "Bad Description",
      "Invalid description for an activity, should be a string or null",
    ],
  };

  static activitiesLimit = 45;

  static create = async (type, title, description = "") => {
    if (!Validate.title(type)) return sRes(this.codes.BAD_TYPE, { type });

    if (!Validate.title(title)) return sRes(this.codes.BAD_TITLE, { title });

    if (!Validate.responseDesc(description))
      return sRes(this.codes.BAD_DESC, { description });

    try {
      await Activity.create({ type, title, description });

      return sRes(serviceCodes.OK, null);
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { type, title, description }, err);
    }
  };

  static getByOffset = async (offset) => {
    try {
      let activities = await Activity.findAll({
        offset,
        limit: this.activitiesLimit,
        order: [[timestampsKeys.createdAt, "desc"]],
      });
      activities = activities.map((a) => a.get({ plain: true }));

      return sRes(serviceCodes.OK, { activities });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { offset }, err);
    }
  };
}

export const Activity_ = ActivityService;

const activity = Activity_.create;
export default activity;
