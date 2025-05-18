import db from "../db/pg.js";
import Category from "../models/Category.js";
import { serviceCodes, sRes } from "../utils/services.js";
import { Validate } from "./ValidationService.js";

class CategoryService {
  // Category service response codes
  static codes = {
    BAD_CATEGORY: [
      "Bad Category",
      "Category does not meet its qualifications, should be a string and at least have a letter",
    ],
  };

  static create = async (name) => {
    if (!Validate.category(name))
      return sRes(this.codes.BAD_CATEGORY, { name });

    try {
      let category = await Category.create({ name });
      category = category.get({ plain: true });

      return sRes(serviceCodes.OK, { category });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, { name }, err);
    }
  };

  static update = async (name, categoryId) => {
    if (!Validate.category(name))
      return sRes(this.codes.BAD_CATEGORY, { name });

    if (!Validate.id(categoryId))
      return sRes(serviceCodes.BAD_ID, { categoryId });

    const t = await db.transaction();

    try {
      const [updateResult] = await Category.update(
        { name },
        { where: { id: categoryId }, transaction: t, individualHooks: true }
      );

      if (updateResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.INVALID_ID, { categoryId });
      }

      let category = await Category.findByPk(categoryId, { transaction: t });
      category = category.get({ plain: true });

      await t.commit();
      return sRes(serviceCodes.OK, { category });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { name, categoryId }, err);
    }
  };

  static delete = async (categoryId) => {
    if (!Validate.id(categoryId))
      return sRes(serviceCodes.BAD_ID, { categoryId });

    const t = await db.transaction();

    try {
      const destroyResult = await Category.destroy({
        where: { id: categoryId },
        transaction: t,
        individualHooks: true,
      });

      if (destroyResult !== 1) {
        await t.rollback();
        return sRes(serviceCodes.INVALID_ID, { categoryId });
      }

      await t.commit();
      return sRes(serviceCodes.OK, { categoryId });
    } catch (err) {
      await t.rollback();
      return sRes(serviceCodes.DB_ERR, { categoryId }, err);
    }
  };

  static getNames = async () => {
    try {
      let categories = await Category.findAll();
      categories = categories.map((c) => c.name);

      return sRes(serviceCodes.OK, { categories });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, null, err);
    }
  };

  static get = async () => {
    try {
      let categories = await Category.findAll();
      categories = categories.map((c) => c.get({ plain: true }));

      return sRes(serviceCodes.OK, { categories });
    } catch (err) {
      return sRes(serviceCodes.DB_ERR, null, err);
    }
  };
}

export const Category_ = CategoryService;
