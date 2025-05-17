import { response } from "express";
import { RC } from "./codes.js";

response.modSend = function (
  message,
  statusCode,
  success = true,
  otherData = {}
) {
  this.status(statusCode).json({ message, success, ...otherData });
};

response.failure = function (
  message,
  statusCode = RC.BAD_REQUEST,
  otherData = {}
) {
  this.modSend(message, statusCode, false, otherData);
};

response.ok = function (message, otherData = {}) {
  this.modSend(message, RC.OK, true, otherData);
};

response.serverError = function () {
  this.modSend("Internal Server Error", RC.INTERNAL_SERVER_ERROR, false);
};

response.created = function (message, otherData = {}) {
  this.modSend(message, RC.CREATED, true, otherData);
};

response.unauth = function (message, otherData = {}) {
  this.modSend(message, RC.UNAUTHORIZED, false, otherData);
};

response.deleted = function () {
  this.sendStatus(204);
};

response.conflict = function (message, otherData = {}) {
  this.modSend(message, RC.CONFLICT, false, otherData);
};

response.forbidden = function (message, otherData = {}) {
  this.modSend(message, RC.FORBIDDEN, false, otherData);
};
