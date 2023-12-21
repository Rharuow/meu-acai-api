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
import { addAdminIdInBody } from "@middlewares/resources/addAdminIdInBody";
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
  validationUserAccessToken,
  checkExact([
    body([], "Body parameters unpermitted"),
    checkSchema(validationListQueryParamsSchema(orderToppingByOptions), [
      "query",
    ]),
    param([], "Router parameters unpermitted"),
  ]),
  validationQueryParams,
  listToppingsController
);

toppingRouter.get(
  "/toppings/:id",
  validationUserAccessToken,
  checkExact([
    body([], "Body parameters unpermitted"),
    query([], "Query parameters unpermitted"),
    param(["id"], "id parameter is required"),
  ]),
  validationParams,
  getToppingController
);

toppingRouter.post(
  "/toppings",
  validationAdminAccessToken,
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
  validationParams,
  validationAdminAccessToken,
  addAdminIdInBody,
  createToppingController
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
