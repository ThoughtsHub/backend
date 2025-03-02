import { response } from "express";
import { c } from "./status_codes.js";

response.failure = function (
  statusCode,
  message = "Something unexpected happened"
) {
  this.status(statusCode).json({ message, success: false });
};

response.bad = function (message = "", additionalData = {}) {
  this.status(c.BAD_REQUEST).json({
    message,
    success: false,
    ...additionalData,
  });
};

response.ok = function (message = "", additionalData = {}) {
  this.status(c.OK).json({ message, success: true, ...additionalData });
};

response.created = function (message = "", additionalData = {}) {
  this.status(c.CREATED).json({ message, success: true, ...additionalData });
};

response.serverError = function (message = "Internal server error") {
  this.failure(c.INTERNAL_SERVER_ERROR, message);
};

response.noParams = function (attributes = []) {
  attributes =
    typeof attributes === "string" ? attributes.split(" ") : attributes;
  let message = "Required parameters not given : " + attributes.join("\n");
  return this.failure(c.BAD_REQUEST, message);
};

response.invalidParams = function (attributes = []) {
  attributes =
    typeof attributes === "string" ? attributes.split(" ") : attributes;
  let message = "Invalid parameters given : " + attributes.join("\n");
  this.failure(c.clientError.UNPROCESSABLE_ENTITY, message);
};

response.noMethod = function () {
  this.sendStatus(c.METHOD_NOT_ALLOWED);
};

response.conflict = function (message = "", additionalData = {}) {
  this.status(c.CONFLICT).json({ message, success: false, ...additionalData });
};

response.forbidden = function (message = "Access not available") {
  this.failure(c.FORBIDDEN, message);
};

response.unauth = function (message = "Unverified user") {
  this.failure(c.UNAUTHORIZED, message);
};

response.deleted = function () {
  this.status(c.NO_CONTENT).json({ message: "Success", success: false });
};
