import db from "../db/pg.js";
import Category from "../models/Category.js";
import { parseFields } from "../utils/field_parser.js";
import { sResult } from "../utils/service_return.js";

const modelFields = "name* value*";
const { fields, reqFields } = parseFields(modelFields);

class CategoryService {
  static status = {
    CREATED: 100,
    DELETED: 101,
    ID_NOT_GIVEN: 200,
    REQ_FIELDS_NOT_GIVEN: 201,
    ID_INVALID: 202,
    ERROR: 500,
  };

  static createNew = async (body) => {
    body.setFields(fields);

    const reqFieldsNotGiven = body.anyNuldefined(reqFields, ", ");
    if (reqFieldsNotGiven.length !== 0)
      return sResult(
        this.status.REQ_FIELDS_NOT_GIVEN,
        `Required: ${reqFieldsNotGiven}`
      );

    try {
      let category = await Category.create(body.data);
      category = category.get({ plain: true });

      return sResult(this.status.CREATED, { category });
    } catch (err) {
      return sResult(this.status.ERROR, err);
    }
  };

  static deleteExisting = async (body) => {
    const id = body.get("id");

    if (typeof id !== "string")
      return sResult(this.status.ID_INVALID, "Invalid Id");

    const t = await db.transaction();
    try {
      const destroyResult = await Category.destroy({
        where: { id },
        transaction: t,
        individualHooks: true,
      });

      if (destroyResult !== 1) {
        await t.rollback();
        return sResult(this.status.ID_INVALID, "Invalid Id");
      }

      await t.commit();
      return sResult(this.status.DELETED);
    } catch (err) {
      await t.rollback();
      return sResult(this.status.ERROR, err);
    }
  };
}

export default CategoryService;
