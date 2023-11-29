import {
  createClientController,
  createManyClientsController,
} from "@controllers/user/client/create";
import {
  createManyUserController,
  createUserController,
} from "@controllers/user/create";
import { getUserController } from "@controllers/user/get";
import { listUserController } from "@controllers/user/list";
import { updateUserController } from "@controllers/user/update";
import {
  validationParams,
  validationQueryParams,
} from "@middlewares/paramsRouter";
import { Router } from "express";
import { updateClientController } from "@controllers/user/client/update";
import { addRoleIdAtBody } from "@middlewares/resources/user/client/addRoleIdAtBody";
import { addIncludesClientAndRoleAtBody } from "@middlewares/resources/user/client/addIncludesClientAndRoleAtBody";
import { addIncludesClientAtQuery } from "@middlewares/resources/user/client/addIncludesClientAtQuery";
import {
  Schema,
  check,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";
import { createAddressController } from "@controllers/address/create";
import { addNextToBody } from "@middlewares/resources/user/client/addNextToBody";
import { updateBodyUser } from "@middlewares/resources/user/updateBody";

export const validationCreateClientBodySchema: Schema = {
  name: {
    notEmpty: true,
    isString: true,
    errorMessage: "name must be a string and not empty",
  },
  password: {
    notEmpty: true,
    isString: true,
    errorMessage: "password must be a string and not empty",
  },
  roleId: {
    notEmpty: true,
    isString: true,
    errorMessage: "role must be a string and not empty",
  },
  email: {
    optional: true,
    isEmail: true,
    errorMessage: "Invalid email format",
  },
  phone: {
    optional: true,
    isString: true,
    errorMessage: "Phone must be a string",
  },
  address: {
    custom: {
      options: (address) => {
        if (!address || typeof address !== "object") {
          throw new Error("Address must be an object");
        }

        if (!address.house || typeof address.house !== "string") {
          throw new Error("House must be a string and not empty");
        }

        if (!address.square || typeof address.square !== "string") {
          throw new Error("Square must be a string and not empty");
        }

        return true;
      },
    },
  },
};

export const validationUpdateClientBodySchema: Schema = {
  name: {
    notEmpty: false,
    isString: true,
    errorMessage: "name must be a string and not empty",
  },
  password: {
    notEmpty: false,
    isString: true,
    errorMessage: "password must be a string and not empty",
  },
  roleId: {
    notEmpty: false,
    isString: true,
    errorMessage: "role must be a string and not empty",
  },
  email: {
    notEmpty: false,
    optional: true,
    isEmail: true,
    errorMessage: "Invalid email format",
  },
  phone: {
    notEmpty: false,
    optional: true,
    isString: true,
    errorMessage: "Phone must be a string",
  },
};

const clientRouter = Router();

clientRouter.post(
  "/clients",
  addRoleIdAtBody,
  checkExact(
    [
      checkSchema(validationCreateClientBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param([], "Query parameters unpermitted"), // check if has any router parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationParams,
  addNextToBody,
  createAddressController,
  createUserController,
  createClientController
);

clientRouter.post(
  "/clients/createMany",
  addRoleIdAtBody,
  createManyUserController,
  createManyClientsController
);

clientRouter.put(
  "/:userId/clients/:id",
  checkExact(
    [
      checkSchema(validationUpdateClientBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param(["userId", "id"], 'The "id" and "userId" parameter is required'), // check if 'id' is present in the route parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationParams,
  updateBodyUser,
  updateUserController,
  updateClientController
);

clientRouter.get(
  "/:userId/clients/:id",
  addIncludesClientAndRoleAtBody,
  getUserController
);

clientRouter.get(
  "/clients",
  validationQueryParams,
  addIncludesClientAtQuery,
  listUserController
);

export { clientRouter };
