import { createProductController } from "@controllers/product/create";
import { deleteProductController } from "@controllers/product/delete";
import { validationAdminAccessToken } from "@middlewares/authorization/validationAdminAccessToken";
import { validationParams } from "@middlewares/paramsRouter";
import { Router } from "express";
import {
  Schema,
  body,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";

const productRouter = Router();

export const orderProductByOptions = [
  "id",
  "name",
  "price",
  "size",
  "available",
  "maxCreamsAllowed",
  "maxToppingsAllowed",
  "createdAt",
] as const;

const validationCreateSchema: Schema = {
  name: {
    optional: true,
    isString: true,
    errorMessage: "name must be a string",
  },
  price: {
    notEmpty: true,
    isFloat: true,
    errorMessage: "price must be a float number and not empty",
  },
  size: {
    notEmpty: true,
    isString: true,
    errorMessage: "size must be a string and not empty",
  },
  photo: {
    isString: true,
    optional: true,
    errorMessage: "photo must be a string",
  },
  available: {
    isBoolean: true,
    optional: true,
    errorMessage: "available must be a boolean",
  },
  maxCreamsAllowed: {
    isNumeric: true,
    notEmpty: true,
    errorMessage: "maxCreamsAllowed must be a number and not empty",
  },
  maxToppingsAllowed: {
    isNumeric: true,
    notEmpty: true,
    errorMessage: "maxToppingsAllowed must be a number and not empty",
  },
};

productRouter.post(
  "/products",
  checkExact(
    [
      checkSchema(validationCreateSchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param([], "Query parameters unpermitted"), // check if has any router parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationAdminAccessToken,
  validationParams,
  createProductController
);

productRouter.delete(
  "/products/:id",
  validationAdminAccessToken,
  checkExact(
    [
      body([], "Body parameters not permitted"),
      query([], "Query parameters unpermitted"),
      param(["id"], "Param(s) not permitted"),
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  deleteProductController
);

export { productRouter };
