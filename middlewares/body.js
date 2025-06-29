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
  "wordId",
  "id",
  "reason",
  "message",
  "status",
  "priority",
  "hindiTitle",
  "hindiBody",
  "category",
  "feedbackId",
  "reportId",
  "maxSize",
  "name",
  "guessedCorrectly",
  "day",
  "word",
  "hindiTranslation",
  "englishMeaning",
  "hindiMeaning",
  "englishSentenceUse",
  "hindiSentenceUser",
  "following",
  "startYear",
  "startMonth",
  "endYear",
  "endMonth",
  "isCompleted",
  "instituteId",
  "educationId",
  "tokens",
  "toExclude",
  "review",
  "rating",
  "discussionId",
];
const valuesInQuery = [
  "timestamp",
  "offset",
  "forumId",
  "userId",
  "commentId",
  "profileId",
  "feedbackId",
  "categoryId",
  "reportId",
  "educationId",
  "instituteId",
  "category",
  "newsId",
  "wordId",
  "status",
  "priority",
  "message",
  "reason",
  "title",
  "body",
  "username",
  "all",
  "matchCaseTitle",
  "matchCaseBody",
  "title",
  "body",
  "hindiTitle",
  "hindiBody",
  "status",
  "imageUrl",
  "newsUrl",
  "categories",
  "order",
  "day",
  "aisheCode",
  "page",
  "discussionId",
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

  res.originalBody = reqBody;
  res.originalQuery = reqQuery;

  req.body = body;
  req.query = query;
  next();
};

const isBadValue = (val) => {
  return val === undefined;
};
