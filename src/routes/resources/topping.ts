import { createToppingController } from "@controllers/topping/create";
import {
  deleteManyToppingsController,
  deleteToppingController,
} from "@controllers/topping/delete";
import { getToppingController } from "@controllers/topping/get";
import { validationAdminAccessToken } from "@middlewares/authorization/validationAdminAccessToken";
import { validationUserAccessToken } from "@middlewares/authorization/validationUserAccessToken";
import {
  validationParams,
  validationQueryParams,
} from "@middlewares/paramsRouter";
import { Router } from "express";
import {
  Schema,
  body,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";
import { validationListQueryParamsSchema } from "./list/schema";
import { listToppingsController } from "@controllers/topping/list";
import { idsInQueryParams } from "@middlewares/resources/idsInQueryParams";
import { notEmptyRequestBody } from "@middlewares/notEmptyRequestBody";
import { updateToppingController } from "@controllers/topping/update";

export const validationCreateToppingBodySchema: Schema = {
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
  available: {
    isBoolean: true,
    optional: true,
    errorMessage: "isSpecial must be a boolean",
  },
};

export const validationUpdateToppingBodySchema: Schema = {
  name: {
    optional: true,
    isString: true,
    errorMessage: "name must be a string",
  },
  amount: {
    optional: true,
    isNumeric: true,
    errorMessage: "amount must be a number and not empty",
  },
  price: {
    optional: true,
    isNumeric: true,
    errorMessage: "price must be a number and not empty",
  },
  unit: {
    optional: true,
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
  available: {
    isBoolean: true,
    optional: true,
    errorMessage: "isSpecial must be a boolean",
  },
};

const toppingRouter = Router();

export const orderToppingByOptions = [
  "id:asc",
  "id:desc",
  "name:asc",
  "name:desc",
  "price:asc",
  "price:desc",
  "amount:asc",
  "amount:desc",
  "createdAt:asc",
  "createdAt:desc",
] as const;

toppingRouter.get(
  "/toppings",
  checkExact([
    body([], "Body parameters unpermitted"),
    checkSchema(validationListQueryParamsSchema(orderToppingByOptions), [
      "query",
    ]),
    param([], "Router parameters unpermitted"),
  ]),
  validationQueryParams,
  validationUserAccessToken,
  listToppingsController
);

toppingRouter.get(
  "/toppings/:id",
  checkExact([
    body([], "Body parameters unpermitted"),
    query([], "Query parameters unpermitted"),
    param(["id"], "id parameter is required"),
  ]),
  validationParams,
  validationUserAccessToken,
  getToppingController
);

toppingRouter.post(
  "/toppings",
  checkExact(
    [
      checkSchema(validationCreateToppingBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param([], "Query parameters unpermitted"), // check if has any router parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationAdminAccessToken,
  validationParams,
  createToppingController
);

toppingRouter.put(
  "/toppings/:id",
  notEmptyRequestBody,
  checkExact(
    [
      checkSchema(validationUpdateToppingBodySchema, ["body"]),
      query([], "Query parameters unpermitted"),
      param(["id"], "id parameter is required"),
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationAdminAccessToken,
  validationParams,
  updateToppingController
);

toppingRouter.delete(
  "/toppings/deleteMany",
  idsInQueryParams,
  validationAdminAccessToken,
  deleteManyToppingsController
);

toppingRouter.delete(
  "/toppings/:id",
  checkExact([
    body([], "Body parameters unpermitted"),
    query([], "Query parameters unpermitted"),
    param(["id"], "id parameter is required"),
  ]),
  validationParams,
  validationAdminAccessToken,
  deleteToppingController
);

export { toppingRouter };
