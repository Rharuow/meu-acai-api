import { Schema } from "express-validator";

export const validationListQueryParamsSchema: (
  options: readonly string[]
) => Schema = (options) => ({
  page: {
    optional: true,
    isNumeric: true,
    errorMessage: "page must be a number",
  },
  perPage: {
    optional: true,
    isNumeric: true,
    errorMessage: "perPage must be a number",
  },
  orderBy: {
    optional: true,
    isString: true,
    notEmpty: false,
    custom: {
      options: (value) => options.includes(value),
      errorMessage: "Invalid value for orderBy",
    },
    errorMessage: "the format of the order field is field:asc or field:desc",
  },
  filter: {
    optional: true,
    isString: true,
    errorMessage:
      "the format of the filter field is field:value or field:operator:value",
  },
});
