import db from "../db/pg.js";
import Report from "../models/Report.js";
import { parseFields } from "../utils/field_parser.js";
import { idInvalidOrMissing, reqFieldsNotGiven } from "../utils/service_checks.js";
import { sResult } from "../utils/service_return.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";

const modelFields = "reason* userId forumId";
const { fields, reqFields } = parseFields(modelFields);

class ReportService {
  static createNew = async (body) => {
    const profileId = body.get("profileId");
    body.setFields(fields);

    let idCheck = idInvalidOrMissing(userId, "User");
    if (idCheck !== false) return idCheck;

    let reqFieldsCheck = reqFieldsNotGiven(body, reqFields);
    if (reqFieldsCheck !== false) return reqFieldsCheck;

    const t = await db.transaction();
    try {
      let report = await Report.create(
        { ...body.data, profileId },
        { transaction: t }
      );
      report = report.get({ plain: true });

      await t.commit();
      return sResult(SERVICE_CODE.CREATED, { report });
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };
}

export default ReportService;
