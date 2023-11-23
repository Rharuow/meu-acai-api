import { Router } from "express";
import {
  Schema,
  check,
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
import { updateCreamController } from "@controllers/cream/update";

export const validationCreateCreamBodySchema: Schema = {
  name: {
    notEmpty: true,
    isString: true,
    errorMessage: "name must be a string",
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
    errorMessage: "photo must be a string",
  },
  isSpecial: {
    isBoolean: true,
    optional: true,
    errorMessage: "isSpecial must be a boolean",
  },
};

export const validationUpdateCreamBodySchema: Schema = {
  name: {
    optional: true,
    isString: true,
    errorMessage: "name must be a string",
  },
  amount: {
    optional: true,
    isNumeric: true,
    errorMessage: "amount must be a number",
  },
  price: {
    optional: true,
    isNumeric: true,
    errorMessage: "price must be a number",
  },
  unit: {
    optional: true,
    isString: true,
    errorMessage: "unit must be a string",
  },
  photo: {
    isString: true,
    optional: true,
    errorMessage: "photo must be a string",
  },
  isSpecial: {
    isBoolean: true,
    optional: true,
    errorMessage: "isSpecial must be a boolean",
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
      checkSchema(validationCreateCreamBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param([], "Query parameters unpermitted"), // check if has any router parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationParams,
  validationAdminAccessToken,
  createCreamController
);

creamRouter.put(
  "/creams/:id",
  checkExact(
    [
      checkSchema(validationUpdateCreamBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param(["id"], 'The "id" parameter is required'), // check if 'id' is present in the route parameters
      // Check if at least one property exists in the request body
      check().custom((value, { req }) => {
        const { name, amount, price, unit, photo, isSpecial } = req.body;

        if (!name && !amount && !price && !unit && !photo && !isSpecial) {
          throw new Error(
            "At least one property must exist in the request body"
          );
        }

        return true;
      }),
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationParams,
  validationAdminAccessToken,
  updateCreamController
);

export { creamRouter };
