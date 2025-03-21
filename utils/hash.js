import { createHash } from "crypto";

export const hashSHA256 = (message) => {
  const hash = createHash("SHA256");
  hash.update(message);
  return hash.digest("hex");
};
