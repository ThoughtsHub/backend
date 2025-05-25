import { Category_ } from "../../services/CategoryService.js";
import { logOk, logServerErr } from "../../services/LogService.js";
import { serviceResultBadHandler } from "../../utils/services.js";

class CategoryController {
  static create = async (req, res) => {
    const { name } = req.body;

    try {
      const result = await Category_.create(name);
      if (serviceResultBadHandler(result, res, "Category creation failed"))
        return;

      const category = result.info.category;

      res.ok("Category created", { category });

      logOk("Category created", "Admin created a category", {
        category,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default CategoryController;
