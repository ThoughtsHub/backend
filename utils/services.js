// service result
export const sRes = (
  code = serviceCodes.DATABASE_ERR,
  info = null,
  err = null
) => {
  console.log({ code, info, err });
  return { code, info, err };
};

export const serviceCodes = {
  OK: "Success",
  DB_ERR: "Database Error",
  BAD_ID: "Bad Id",
  INVALID_ID: "Invalid Id",
};
