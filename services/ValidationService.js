import { status as FeedbackStatus } from "../models/Feedback.js";
import { responseTypes } from "../models/Log.js";
import { status as NewsStatus } from "../models/News.js";
import {
  status as ForumReportStatus,
  priority,
} from "../models/Report_Forum.js";
import { isNull, isNumber, isString } from "../utils/checks.js";

const usernameRegex = /^[a-zA-Z0-9]{3,}$/;

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

class ValidateService {
  static email = (val) => isString(val) && emailRegex.test(val);

  // indian mobile numbers currently
  static mobile = (val) => isString(val) && val.length === 10;

  static password = (val) => isString(val) && val.length >= 8;

  static id = (val) => isString(val) && val.length >= 1;

  static username = (val) => isString(val) && usernameRegex.test(val);

  static fullName = (val) => isString(val) && val.length >= 3;

  static about = (val) => isString(val);

  static gender = (val) =>
    ["Male", "Female", "Other"].includes(val) || isNull(val);

  static dob = (val) => {
    if (isNull(val)) return true;
    if (!isNumber(val)) return false;

    const ageInMs = Date.now() - val;
    const ageInYears = ageInMs / (365.25 * 24 * 60 * 60 * 1000); // account for leap years

    return ageInYears >= 3 && ageInYears <= 80;
  };

  static profileImageUrl = (val) => isString(val) || isNull(val);

  static imageUrl = (val) => isString(val) || isNull(val);

  static appreciationValue = (val) => val === 1 || val === 0;

  static newsUrl = (val) => isString(val) || isNull(val);

  static localId = (val) => isString(val) || isNull(val);

  static title = (val) => isString(val) && val.length >= 1;
  static newsTitle = (val) => isString(val) || isNull(val);

  static body = (val) => isString(val) && val.length >= 1;
  static newsBody = (val) => isString(val) || isNull(val);

  static newsStatus = (val) => Object.values(NewsStatus).includes(val);

  static category = (val) => (isString(val) && val.length >= 1) || isNull(val);

  static forumReportStatus = (val) =>
    Object.values(ForumReportStatus).includes(val);

  static priority = (val) => Object.values(priority).includes(val);

  static reason = (val) => isString(val) || isNull(val);

  static message = (val) => isString(val) && val.length >= 1;

  static feedbackStatus = (val) => Object.values(FeedbackStatus).includes(val);

  static responseCode = (val) => isNumber(val);

  static responseType = (val) => Object.values(responseTypes).includes(val);

  static responseDesc = (val) => isString(val) || isNull(val);

  static responseValues = (val) => typeof val == "object";
}

export const Validate = ValidateService;
