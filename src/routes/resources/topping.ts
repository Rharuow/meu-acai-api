import { createToppingController } from "@controllers/topping/create";
import { validationAdminAccessToken } from "@middlewares/authorization/validationAdminAccessToken";
import { validationParams } from "@middlewares/paramsRouter";
import { addAdminIdInBody } from "@middlewares/resources/addAdminIdInBody";
import { Router } from "express";
import {
  Schema,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";

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

export { toppingRouter };
