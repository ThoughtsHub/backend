// create news
// update news
// get news by offset
// delete news

// get forums by offset
// delete forums if needed
// get forums appreciate profiles
// get forum comments
// delete forum comments if needed

// get users by offset with thier contacts
// delete users if needed and notify users with email

// get reports by offset
// update status and priorities of reports

// get feedback by offset
// update status of feedbacks

// get latest logs (top 100)
// get logs by offset

// get latest activities (top 100)
// get activities by offset

import chalk from "chalk";
import promptSync from "prompt-sync";
import { exit } from "../utils/shutdown.js";

let authToken = null;
const showFullResult = false;

let baseUrl = "http://localhost:4000";

/**
 *
 * @param {"GET" | "POST" | "PUT" | "PATCH" | "DELETE"} method
 * @param {string} url
 * @param {object} body
 */
const _fetch = async (method, url, body = null) => {
  try {
    let result = await fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        auth_token: authToken,
      },
      ...(["GET", "HEAD", "DELETE"].includes(method)
        ? {}
        : { body: JSON.stringify(body) }),
    });
    let json = await result.json();
    return { isOk: result.ok, json };
  } catch (err) {
    return { isOk: false, json: { reason: "Fetch failed", err } };
  }
};

const isPassed = (testTitle, result, expectation = true) => {
  console.log(
    (result.isOk === expectation
      ? chalk.green.bold("Test Passed")
      : chalk.red.bold("Test Failed")) +
      ` - ${testTitle} [ ${chalk.blueBright(result.json.message)} ]`
  );
  if (showFullResult) console.log(result.json);
};

// Test - Login with admin account with correct credentials
{
  let result = await _fetch("POST", "/login", {
    email: "admin@thoughtshub.com",
    password: "admin582",
  });
  if (result.isOk) authToken = result.json.auth_token;
  isPassed("Login with admin account with correct credentials", result, true);
}

// change baseUrl to /admin
baseUrl = baseUrl + "/admin";

let newsId = null;
// Test - Create news
{
  let result = await _fetch("POST", "/news", {
    title: "This lady never dares to go close",
    body: "Look at this daring lady",
    status: "Draft",
  });
  if (result.isOk) newsId = result.json.news.id;
  isPassed("Create news", result, true);
}

// Test - Update news with bad category
{
  let result = await _fetch("PUT", "/news", {
    title: "How is this",
    hindiTitle: "Hello there",
    category: "hola",
    newsId,
  });
  isPassed("Update news with bad category", result, false);
}

// Test - Update news
{
  let result = await _fetch("PUT", "/news", {
    title: "How is this",
    hindiTitle: "Hello there",
    newsId,
  });
  isPassed("Update news", result, true);
}

// Test - Update news, change status to published
{
  let result = await _fetch("PATCH", "/news", { status: "Published", newsId });
  isPassed("Update news, change status to published", result, true);
}

// Test - Get news
{
  let result = await _fetch("GET", "/news?status=Published&all=false");
  isPassed("Get news", result, true);
}

// Test - delete news
{
  let result = await _fetch("DELETE", `/news?newsId=${newsId}`);
  isPassed("Delete news", result, true);
}

let forumId = null,
  forumProfileId;
// Test - Get Forums
{
  let result = await _fetch("GET", "/forums");
  if (result.isOk) {
    forumId = result.json.forums[0].id;
    forumProfileId = result.json.forums[0].profileId;
  }
  isPassed("Get forums", result, true);
}

let commentId = null,
  commentProfileId,
  commentForumId;
// Test - Get Forum Comments
{
  let result = await _fetch("GET", `/forums/comments?forumId=${forumId}`);
  if (result.isOk) {
    commentId = result.json.comments[0].id;
    commentProfileId = result.json.comments[0].profileId;
    commentForumId = result.json.comments[0].forumId;
  }
  isPassed("Get comments", result, true);
}

// Test - Get forum appreciations
{
  let result = await _fetch("GET", "/forums/appreciation");
  isPassed("Get forum appreciations", result, true);
}

// // Test - Delete comment
// {
//   let result = await _fetch(
//     "DELETE",
//     `/forums/comments?commentId=${commentId}&profileId=${commentProfileId}&forumId=${forumId}`
//   );
//   isPassed("Delete comment", result, true);
// }

// // Test - Delete forum
// {
//   let result = await _fetch(
//     "DELETE",
//     `/forums?forumId=${forumId}&profileId=${forumProfileId}`
//   );
//   isPassed("Delete forum", result, true);
// }

// Test - Get users
{
  let result = await _fetch("GET", "/users");
  isPassed("Get users", result, true);
}

let feedbackId;
// Test - Get feedback
{
  let result = await _fetch("GET", "/feedback");
  if (result.isOk) feedbackId = result.json.feedbacks[0].id;
  isPassed("Get feedbacks", result, true);
}

// Test - Update feedback status
{
  let result = await _fetch("PUT", "/feedback", {
    feedbackId,
    status: "Checked",
  });
  isPassed("Update feedback", result, true);
}

// Test - Get Reports
{
  let result = await _fetch("GET", "/report/forums");
  isPassed("Get reports", result, true);
}

// Test - Get logs
{
  let result = await _fetch("GET", "/logs");
  isPassed("Get logs", result, true);
}

// Test - Get activity
{
  let result = await _fetch("GET", "/activity?type=Feedback");
  isPassed("Get activity", result, true);
}
