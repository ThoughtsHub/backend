import { DataTypes as dt } from "sequelize";
import attr from "../constants/db.js";
import { db } from "../db/connect.js";
import _env from "../constants/env.js";
import { join } from "path";

const Upload = db.define(
  "Upload",
  {
    id: attr.id,
    name: dt.STRING,
    handle: { type: dt.STRING, allowNull: false },
    ext: { type: dt.STRING, allowNull: false },
    url: {
      type: dt.VIRTUAL,
      get() {
        return join(
          _env.app.URL,
          _env.app.UPLOADS.URL,
          this.handle + "." + this.ext
        );
      },
    },
    filename: {
      type: dt.VIRTUAL,
      get() {
        return join(_env.app.UPLOADS.URL, this.handle + "." + this.ext);
      },
    },
  },
  // a user can have only one file with a handle of same name
  { indexes: [{ fields: ["userId", "handle"], type: "UNIQUE" }] }
);

export default Upload;
