import { Router } from "express";
import {
  Schema,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";

import { listCreamController } from "@controllers/cream";
import { validationUserAccessToken } from "@middlewares/authorization/validationUserAccessToken";
import { validationQueryParams } from "@middlewares/resources/creams/queryParams";
import { createCreamController } from "@controllers/cream/create";
import { validationParams } from "@middlewares/paramsRouter";
import { validationAdminAccessToken } from "@middlewares/authorization/validationAdminAccessToken";

export const validationBodySchema: Schema = {
  name: {
    notEmpty: true,
    isString: true,
    errorMessage: "name must be a string and not empty",
  },
  amount: {
    notEmpty: true,
    isNumeric: true,
    errorMessage: "amount must be a number and not empty",
  },
  price: {
    notEmpty: true,
    isNumeric: true,
    errorMessage: "price must be a number and not empty",
  },
  unit: {
    notEmpty: true,
    isString: true,
    errorMessage: "unit must be a string and not empty",
  },
  photo: {
    isString: true,
    optional: true,
    errorMessage: "photo must be a string and not empty",
  },
};

const creamRouter = Router();

creamRouter.get(
  "/creams",
  validationUserAccessToken,
  validationQueryParams,
  listCreamController
);

creamRouter.post(
  "/creams",
  checkExact(
    [
      checkSchema(validationBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param([], "Query parameters unpermitted"), // check if has any router parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationAdminAccessToken,
  validationParams,
  createCreamController
);

export { creamRouter };
