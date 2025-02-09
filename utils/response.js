import { response } from "express";
import c from "./status_codes.js";

response.failure = function (
  statusCode,
  message = "Something unexpected happened"
) {
  this.status(statusCode).json({ message });
};

response.ok = function (message = "", additionalData = {}) {
  this.status(c.OK).json({ message, ...additionalData });
};

response.created = function (message = "", additionalData = {}) {
  this.status(c.CREATED).json({ message, ...additionalData });
};

response.serverError = function () {
  this.failure(c.INTERNAL_SERVER_ERROR, "Internal server error");
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

response.forbidden = function (message = "Access not available") {
  this.failure(c.FORBIDDEN, message);
};

response.deleted = function () {
  this.sendStatus(c.NO_CONTENT);
};
