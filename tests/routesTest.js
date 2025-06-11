import chalk from "chalk";
import promptSync from "prompt-sync";
import { exit } from "../utils/shutdown.js";

const prompt = promptSync();

let authToken = null;
let haveProfile = null;
const showFullResult = false;

const baseUrl = "http://localhost:4000";

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

const signupTestRun = false;
// Signup test
// Should run with a new email, (not with something that is already have an account)
if (signupTestRun === true) {
  let result = await _fetch("POST", "/otp/get", {
    email: "kartikey.hom@gmail.com",
  });
  if (result.isOk) {
    let otp = prompt("OTP: ");
    let result2 = await _fetch("POST", "/otp/verify", {
      contact: "kartikey.hom@gmail.com",
      otp,
    });
    if (result2.isOk) {
      let password = prompt("Password: ");
      let result3 = await _fetch("POST", "/signup/create-password", {
        otpToken: result2.json.otpToken,
        password,
      });
      isPassed("Signup with email and password", result3, true);
    } else {
      isPassed("Signup with email and password", result2, true);
    }
  } else {
    isPassed("Signup with email and password", result, true);
  }
}

// Login test

// Test - Login user with correct email and password
{
  let result = await _fetch("POST", "/login", {
    email: "kartikey.hom@gmail.com",
    password: "iamthebest",
  });
  if (result.isOk) authToken = result.json.auth_token;
  isPassed("Login user with correct email and password", result, true);
}

// Test - Login user with incorrect email
{
  let result = await _fetch("POST", "/login", {
    email: "kartikey.hom2@gmail.com",
    password: "iamthebest",
  });
  isPassed("Login user with incorrect email", result, false);
}

// Test - Login user with correct email and incorrect password
{
  let result = await _fetch("POST", "/login", {
    email: "kartikey.hom@gmail.com",
    password: "iamnotthebest",
  });
  isPassed(
    "Login user with correct email and incorrect password",
    result,
    false
  );
}

// Test - Logout user that is logged in
{
  let result = await _fetch("GET", "/logout");
  if (result.isOk) authToken = null;
  isPassed("Logout user that is logged in", result, true);
}

// Test - Logout user that is not logged in
{
  let result = await _fetch("GET", "/logout");
  if (result.isOk) authToken = null;
  isPassed("Logout user that is not logged in", result, false);
}

// User signin after logging out
{
  let result = await _fetch("POST", "/login", {
    email: "kartikey.hom@gmail.com",
    password: "iamthebest",
  });
  if (!result.isOk) process.exit();
  authToken = result.json.auth_token;
}

//  Check if profile created
{
  let result = await _fetch("GET", "/profile/me");
  haveProfile = result.isOk;
}

// Test - Check Username available
{
  let result = await _fetch("GET", "/check-username?username=kartikey");
  isPassed("Check Username available", result, true);
}

// Test - Creating Profile
{
  let result = await _fetch("POST", "/profile", {
    fullName: "Kartikey kumr",
    username: "kartikey",
    about: "Hello there",
    gender: "Male",
    dob: Math.floor(new Date("2003-01-19T00:00:00Z").getTime() / 1000),
    profileImageUrl: "",
  });
  isPassed(
    `Creating Profile when ${haveProfile ? "created" : "not created"}`,
    result,
    !haveProfile
  );
}

// Test - Update Profile
{
  let result = await _fetch("PUT", "/profile", {
    fullName: "Kartikey",
    username: "joker2",
  });
  isPassed("Update Profile", result, true);
}

// Test - Get users
{
  let result = await _fetch("GET", "/users");
  isPassed("Get users", result, true);
}

let forumId = null;
// Test - Create forums
{
  let result = await _fetch("POST", "/forums", {
    title: "How is this done",
    body: "Hello there, I am really interested in knowing how to do this??",
  });
  if (result.isOk) forumId = result.json.forum.id;
  isPassed("Create forum", result, true);
}

// Test - Appreciate forum
{
  let result = await _fetch("POST", "/forums/upvote", { forumId, value: true });
  isPassed("Appreciate forum", result, true);

  if (showFullResult) {
    let result2 = await _fetch("GET", "/forums");
    if (result2.isOk) console.log(result2.json.forums[0]);
    else console.log("Request failed");
  }
}

// Test - Unappreciate forum
{
  let result = await _fetch("POST", "/forums/upvote", {
    forumId,
    value: false,
  });
  isPassed("Unappreciate forum", result, true);

  if (showFullResult) {
    let result2 = await _fetch("GET", "/forums");
    if (result2.isOk) console.log(result2.json.forums[0]);
    else console.log("Request failed");
  }
}

// Test - Update Forum
{
  let result = await _fetch("PATCH", "/forums", {
    id: forumId,
    title: "This is BAD!!!",
  });
  isPassed("Update forum", result, true);
}

let commentId = null;
// Test - Comment on forum
{
  let result = await _fetch("POST", "/forums/comments", {
    forumId,
    body: "This is fire 😱",
    localId: "35423-3252-3-325252",
  });
  if (result.isOk) commentId = result.json.comment.id;
  isPassed("Comment on forum", result, true);

  if (showFullResult) {
    let result2 = await _fetch("GET", "/forums");
    if (result2.isOk) console.log(result2.json.forums[0]);
    else console.log("Request failed");
  }
}

// some comments on forum
{
  _fetch("POST", "/forums/comments", { forumId, body: "Hello there" });
  _fetch("POST", "/forums/comments", { forumId, body: "This si good" });
  _fetch("POST", "/forums/comments", { forumId, body: "Si Sii" });
}

// Test - Update comment on forum
{
  let result = await _fetch("PUT", "/forums/comments", {
    commentId,
    forumId,
    localId: "q424235-3254-2345",
  });
  isPassed("Update comment on forum", result, true);
}

// Test - delete comment on forum (not deleted yet)
{
  let result = await _fetch(
    "DELETE",
    `/forums/comments?commentId=${commentId}`
  );
  isPassed("Delete comment on forum (not deleted yet)", result, true);
}

// Test - delete comment on forum (deleted already)
{
  let result = await _fetch(
    "DELETE",
    `/forums/comments?commentId=${commentId}`
  );
  isPassed("Delete comment on forum (deleted already)", result, false);

  if (showFullResult) {
    let result2 = await _fetch("GET", "/forums");
    if (result2.isOk) console.log(result2.json.forums[0]);
    else console.log("Request failed");
  }
}

// Test - delete forum (not deleted yet)
{
  let result = await _fetch("DELETE", `/forums?forumId=${forumId}`);
  isPassed("Delete forum (not deleted yet)", result, true);
}

// Test - delete forum (deleted already)
{
  let result = await _fetch("DELETE", `/forums?forumId=${forumId}`);
  isPassed("Delete forum (deleted already)", result, false);

  if (showFullResult) {
    let result2 = await _fetch("GET", "/profile/me");
    if (result2.isOk) console.log(result2.json);
    else console.log("Failed request");
  }
}

// Test - Fetch News
{
  let result = await _fetch("GET", "/news");
  isPassed("Fetch news", result, true);
}

// Test - Fetch Categories
{
  let result = await _fetch("GET", "/categories");
  isPassed("Fetch Categories", result, true);
}

// creating a new forum for reporting
{
  let result = await _fetch("POST", "/forums", {
    title: "Nobody can take it away from me",
    body: "Hello there, how are you!!",
  });
  if (!result.isOk) exit() && console.log(result);
  else forumId = result.json.forum.id;
}

// Test - Report a forum
{
  let result = await _fetch("POST", "/report/forum", { postId: forumId });
  isPassed("Report a forum", result, true);
}

// deleting the said forum
{
  let result = await _fetch("DELETE", `/forums?forumId=${forumId}`);
  if (!result.isOk) exit() && console.log(result);
}

// Test - Feedback
{
  let result = await _fetch("POST", "/feedback", {
    message: "Can you change your UI?? like better 😓",
  });
  isPassed("Feedback", result, true);
}

// Test - Notifications
{
  let result = await _fetch("GET", "/notification");
  isPassed("Notification", result, true);
}
