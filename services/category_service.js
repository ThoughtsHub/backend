import db from "../db/pg.js";
import Category from "../models/Category.js";
import { parseFields } from "../utils/field_parser.js";
import { sResult } from "../utils/service_return.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";

const modelFields = "name* value*";
const { fields, reqFields } = parseFields(modelFields);

class CategoryService {
  static createNew = async (body) => {
    body.setFields(fields);

    const reqFieldsNotGiven = body.anyNuldefined(reqFields, ", ");
    if (reqFieldsNotGiven.length !== 0)
      return sResult(
        SERVICE_CODE.REQ_FIELDS_MISSING,
        `Required: ${reqFieldsNotGiven}`
      );

    try {
      let category = await Category.create(body.data);
      category = category.get({ plain: true });

      return sResult(SERVICE_CODE.CREATED, { category });
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };

  static deleteExisting = async (body) => {
    const id = body.get("id");

    if (typeof id !== "string")
      return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");

    const t = await db.transaction();
    try {
      const destroyResult = await Category.destroy({
        where: { id },
        transaction: t,
        individualHooks: true,
      });

      if (destroyResult !== 1) {
        await t.rollback();
        return sResult(SERVICE_CODE.ID_INVALID, "Invalid Id");
      }

      await t.commit();
      return sResult(SERVICE_CODE.DELETED);
    } catch (err) {
      await t.rollback();
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };
}

export default CategoryService;
