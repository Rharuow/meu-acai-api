import { Router } from "express";
import {
  Schema,
  body,
  check,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";

import { listCreamController } from "@controllers/cream/list";
import { validationUserAccessToken } from "@middlewares/authorization/validationUserAccessToken";
import { validationQueryParams } from "@middlewares/paramsRouter";
import { createCreamController } from "@controllers/cream/create";
import { validationParams } from "@middlewares/paramsRouter";
import { validationAdminAccessToken } from "@middlewares/authorization/validationAdminAccessToken";
import { updateCreamController } from "@controllers/cream/update";
import { getCreamController } from "@controllers/cream/get";
import {
  deleteCreamController,
  deleteManyCreamsController,
} from "@controllers/cream/delete";
import { idsInQueryParams } from "@middlewares/resources/idsInQueryParams";
import { validationListQueryParamsSchema } from "./list/schema";
import { validationFilterParams } from "@middlewares/resources/cream/validationFilterParams";

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
  available: {
    isBoolean: true,
    optional: true,
    errorMessage: "available must be a boolean",
  },
};

export const paramsCreamByOptions = [
  "id",
  "name",
  "price",
  "amount",
  "available",
  "isSpecial",
  "createdAt",
] as const;

const creamRouter = Router();

creamRouter.get(
  "/creams",
  validationFilterParams,
  checkExact(
    [
      checkSchema(validationListQueryParamsSchema(paramsCreamByOptions), [
        "query",
      ]),
      body([], "Query parameters unpermitted"), // check if has any query parameters
      param([], "Query parameters unpermitted"), // check if has any router parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationQueryParams,
  validationUserAccessToken,
  listCreamController
);

creamRouter.get(
  "/creams/:id",
  validationUserAccessToken,
  validationQueryParams,
  getCreamController
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
        const { name, amount, price, unit, photo, isSpecial, available } =
          req.body;

        if (
          !name &&
          !amount &&
          !price &&
          !unit &&
          !photo &&
          !isSpecial &&
          !available
        ) {
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

creamRouter.delete(
  "/creams/deleteMany",
  idsInQueryParams,
  validationAdminAccessToken,
  deleteManyCreamsController
);

creamRouter.delete(
  "/creams/:id",
  checkExact(
    [
      body([], "Body is not permitted"),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param(["id"], 'The "id" parameter is required'), // check if 'id' is present in the route parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationAdminAccessToken,
  deleteCreamController
);

export { creamRouter };
