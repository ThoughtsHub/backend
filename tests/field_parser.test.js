import { parseFields } from "../utils/field_parser.js";
import { test, expect } from "vitest";

test(`parse "name* value*"`, () => {
  expect(parseFields("name* value*")).toEqual({
    fields: ["name", "value"],
    reqFields: ["name", "value"],
  });
});

test(`parse "name value*"`, () => {
  expect(parseFields("name value*")).toEqual({
    fields: ["name", "value"],
    reqFields: ["value"],
  });
});

test(`parse "username email mobile password*"`, () => {
  expect(parseFields("username email mobile password*")).toEqual({
    fields: ["username", "email", "mobile", "password"],
    reqFields: ["password"],
  });
});
