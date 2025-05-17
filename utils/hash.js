import bcrypt from "bcryptjs";
import { createHash } from "crypto";

export const hashSHA256 = (message) => {
  const hash = createHash("SHA256");
  hash.update(message);
  return hash.digest("hex");
};

export const hash = (val) => {
  const hashed = bcrypt.hashSync(val, 10);
  return hashed;
};

export const compare = (val, hash) => {
  return bcrypt.compareSync(val, hash);
};
