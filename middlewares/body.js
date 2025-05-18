import { isString } from "../utils/checks.js";

const valuesInBody = [
  "username",
  "contact",
  "otp",
  "otpToken",
  "email",
  "mobile",
  "password",
  "fullName",
  "about",
  "dob",
  "gender",
  "profileImageUrl",
  "imageUrl",
  "newsUrl",
  "title",
  "body",
  "forumId",
  "commentId",
  "profileId",
  "postId",
  "userId",
  "value",
  "newsId",
  "localId",
  "id",
  "reason",
  "message",
  "status",
  "priority",
];
const valuesInQuery = [
  "timestamp",
  "offset",
  "forumId",
  "userId",
  "commentId",
  "profileId",
  "category",
  "newsId",
  "status",
  "priority",
  "message",
  "reason",
  "title",
  "body",
  "username",
];

export const handleBody = (req, res, next) => {
  const body = {},
    query = {},
    reqBody = req.body,
    reqQuery = req.query;

  for (let key of valuesInBody)
    body[key] = isBadValue(reqBody[key]) ? null : reqBody[key];
  for (let key of valuesInQuery)
    query[key] = isBadValue(reqQuery[key]) ? null : reqQuery[key];

  req.body = body;
  req.query = query;
  next();
};

const isBadValue = (val) => {
  return val === undefined;
};
