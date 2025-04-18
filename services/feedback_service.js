import db from "../db/pg.js";
import Feedback from "../models/Feedback.js";
import { parseFields } from "../utils/field_parser.js";
import { idInvalidOrMissing, reqFieldsNotGiven } from "../utils/service_checks.js";
import { sResult } from "../utils/service_return.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";

const modelFields = "message*";
const { fields, reqFields } = parseFields(modelFields);

class FeedbackService {
  static createNew = async (body) => {
    const profileId = body.get("profileId");
    body.setFields(fields);

    let idCheck = idInvalidOrMissing(profileId, "Profile");
    if (idCheck !== false) return idCheck;

    let reqFieldsCheck = reqFieldsNotGiven(body, reqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;

    const t = await db.transaction();
    try {
      let feedback = await Feedback.create(
        { ...body.data, profileId },
        { transaction: t }
      );
      feedback = feedback.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.CREATED, { feedback });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };
}

export default FeedbackService;
