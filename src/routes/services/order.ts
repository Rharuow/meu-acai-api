import { validationAdminAccessToken } from "@middlewares/authorization/validationAdminAccessToken";
import { validationUserAccessToken } from "@middlewares/authorization/validationUserAccessToken";
import { validationParams } from "@middlewares/paramsRouter";
import { createServiceOrder } from "@services/order/create";
import { deleteServiceOrder } from "@services/order/delete";
import { Router } from "express";
import {
  Schema,
  body,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";

export const validationCreateOrderBodySchema: Schema = {
  name: {
    optional: true,
    isString: true,
    errorMessage: "name must be a string",
  },
  size: {
    notEmpty: true,
    isString: true,
    errorMessage: "size must be a string and not empty",
  },
  paymentMethod: {
    notEmpty: true,
    isIn: { options: [["cash", "pix", "card"]] },
    errorMessage:
      "paymentMethod must be a string, not empty and must be 'cash', 'pix' or 'card'",
  },
  isPaid: {
    notEmpty: true,
    isBoolean: true,
    errorMessage: "isPaid must be a boolean and not empty",
  },
  maxCreamsAllowed: {
    notEmpty: true,
    isNumeric: true,
    errorMessage: "maxCreamsAllowed must be a number and not empty",
  },
  maxToppingsAllowed: {
    notEmpty: true,
    isNumeric: true,
    errorMessage: "maxToppingsAllowed must be a string and not empty",
  },
  price: {
    isNumeric: true,
    notEmpty: true,
    errorMessage: "price must be a number and not empty",
  },
  totalPrice: {
    isNumeric: true,
    notEmpty: true,
    errorMessage: "totalPrice must be a number and not empty",
  },
  creams: {
    isArray: true,
    notEmpty: true,
    errorMessage: "creams must be an array and not empty",
    // Add validation for each cream object in the array
    custom: {
      options: (creams: Array<{ name: string; price: number }>) => {
        if (!Array.isArray(creams)) {
          throw new Error("creams must be an array");
        }

        for (const cream of creams) {
          if (typeof cream !== "object" || cream === null) {
            throw new Error("Each cream must be an object");
          }

          // Add specific validation for cream properties (e.g., name, price, etc.)
          // For example, validating that the cream has a name property and it is a string
          if (!cream.name || typeof cream.name !== "string") {
            throw new Error("Each cream must have a valid name");
          }

          if (!cream.price || typeof cream.price !== "number") {
            throw new Error("Each cream must have a valid price");
          }
        }
        return true;
      },
    },
  },
  toppings: {
    isArray: true,
    optional: true,
    errorMessage: "toppings must be an array",
    // Add validation for each topping object in the array
    custom: {
      options: (toppings: Array<null | { name: string; price: number }>) => {
        if (!Array.isArray(toppings)) {
          throw new Error("toppings must be an array");
        }

        for (const topping of toppings) {
          if (typeof topping !== "object") {
            throw new Error("Each topping must be an object");
          }

          // Add specific validation for topping properties (e.g., name, price, etc.)
          // For example, validating that the topping has a name property and it is a string
          if (!topping.name || typeof topping.name !== "string") {
            throw new Error("Each topping must have a valid name");
          }

          if (!topping.price || typeof topping.price !== "number") {
            throw new Error("Each topping must have a valid price");
          }
        }
        return true;
      },
    },
  },
  extras: {
    isArray: true,
    optional: true,
    errorMessage: "extras must be an array",
    // Add validation for each extra object in the array
    custom: {
      options: (extras: Array<null | { name: string; price: number }>) => {
        if (!Array.isArray(extras)) {
          throw new Error("extras must be an array");
        }

        for (const extra of extras) {
          if (typeof extra !== "object" || extra === null) {
            throw new Error("Each extra must be an object");
          }

          // Add specific validation for extra properties (e.g., name, price, etc.)
          // For example, validating that the extra has a name property and it is a string
          if (!extra.name || typeof extra.name !== "string") {
            throw new Error("Each extra must have a valid name");
          }

          if (!extra.price || typeof extra.price !== "number") {
            throw new Error("Each extra must have a valid price");
          }
        }
        return true;
      },
    },
  },
};

const ordersRouter = Router();

ordersRouter.post(
  "/orders",
  checkExact([
    checkSchema(validationCreateOrderBodySchema, ["body"]),
    query([], "Query parameters unpermitted"), // check if has any query parameters
    param([], "Path parameters unpermitted"), // check if has any in the route parameters
  ]),
  validationParams,
  validationUserAccessToken,
  createServiceOrder
);

ordersRouter.delete(
  "/orders/:id",
  checkExact([
    body([], "Body parameters unpermitted"),
    query([], "Query parameters unpermitted"), // check if has any query parameters
    param(["id"], "Just id is permitted in path params"), // check if 'id' is present in the route parameters
  ]),
  validationParams,
  validationAdminAccessToken,
  deleteServiceOrder
);

export { ordersRouter };
