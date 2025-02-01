import { v4 as uuidv4 } from "uuid";
import attr from "../constants/db.js";

const nameLength = 12;
const uniqValLength = 8;

const createHandle = (name, uniqVal = Date.now().toString()) => {
  uniqVal = uniqVal.replaceAll("-", "").substring(0, uniqValLength);

  name = name.replace(/[^a-zA-Z]/g, "");
  const nameLen = name.length > nameLength ? nameLength : name.length;
  name = name.substring(0, nameLen);

  const uniqVal2Len = attr.handle.limit - nameLen - uniqVal.length - 1; // for _
  const uniqVal2 = uuidv4().replaceAll("-", "").substring(0, uniqVal2Len);

  const handle = `${name}_${uniqVal}${uniqVal2}`;

  return handle;
};

const handle = {
  create: createHandle,
};

export default handle;
