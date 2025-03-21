import { response } from "express";

response.modSend = function (
  message,
  statusCode,
  success = true,
  otherData = {}
) {
  this.status(statusCode).json({ message, success, ...otherData });
};

response.failure = function (message, statusCode = 400, otherData = {}) {
  this.modSend(message, statusCode, false, otherData);
};

response.ok = function (message, otherData = {}) {
  this.modSend(message, 200, true, otherData);
};

response.serverError = function () {
  this.modSend("Internal Server Error", 500, false);
};

response.created = function (message, otherData = {}) {
  this.modSend(message, 201, true, otherData);
};

response.unauth = function (message, otherData = {}) {
  this.modSend(message, 401, false, otherData);
};

response.deleted = function () {
  this.sendStatus(204);
};

response.conflict = function (message, otherData = {}) {
  this.modSend(message, 409, false, otherData);
};

response.forbidden = function (message, otherData = {}) {
  this.modSend(message, 403, false, otherData);
};
