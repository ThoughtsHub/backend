import { response } from "express";
import c from "./status_codes.js";

response.failure = function (
  statusCode,
  message = "Something unexpected happened"
) {
  this.status(statusCode).json({ message });
};

response.bad = function (message = "", additionalData = {}) {
  this.status(c.BAD_REQUEST).json({ message, ...additionalData });
};

response.ok = function (message = "", additionalData = {}) {
  this.status(c.OK).json({ message, ...additionalData });
};

response.created = function (message = "", additionalData = {}) {
  this.status(c.CREATED).json({ message, ...additionalData });
};

response.serverError = function (message = "Internal server error") {
  this.failure(c.INTERNAL_SERVER_ERROR, message);
};

response.noParams = function () {
  this.failure(c.BAD_REQUEST, "Required parameters not given");
};

response.invalidParams = function () {
  this.failure(c.clientError.UNPROCESSABLE_ENTITY, "Invalid parameters given");
};

response.noMethod = function () {
  this.sendStatus(c.METHOD_NOT_ALLOWED);
};

response.conflict = function (message = "", additionalData = {}) {
  this.status(c.CONFLICT).json({ message, ...additionalData });
};

response.forbidden = function (message = "Access not available") {
  this.failure(c.FORBIDDEN, message);
};

response.unauth = function (message = "Unverified user") {
  this.failure(c.UNAUTHORIZED, message);
};

response.deleted = function () {
  this.sendStatus(c.NO_CONTENT);
};
