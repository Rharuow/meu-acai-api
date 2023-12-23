import { createClientController } from "@controllers/user/client/create";
import { getUserController } from "@controllers/user/get";
import { listUserController } from "@controllers/user/list";
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
  body,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";
import { validationAdminAccessToken } from "@middlewares/authorization/validationAdminAccessToken";
import { validationAdminOrClientAccessToken } from "@middlewares/authorization/validationAdminOrClientAccessToken";
import { validationUserOwnId } from "@middlewares/authorization/validationUserOwnId";
import { updateBodyClient } from "@middlewares/resources/user/client/updateBody";
import { deleteUserController } from "@controllers/user/delete";
import { clientBelongsToUser } from "@middlewares/resources/user/client/validationClientBelongsToUser";
import { validationMemberBelongsToClient } from "@middlewares/resources/user/client/swap/validationMemberBelongsToClient";
import { swapClientController } from "@controllers/user/client/swap";
import { validationIfAddressAlreadyExists } from "@middlewares/resources/user/client/updatedAddress/validationIfAddressAlreadyExists";
import { updateAddressController } from "@controllers/user/client/updateAddress";
import { validationIfIdRouterClient } from "@middlewares/resources/user/client/updatedAddress/validationIfIdRouterClient";

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
  adminId: {
    notEmpty: true,
    isString: true,
    errorMessage: "adminId must be a string and not empty",
  },
};

export const validationSwapClientBodySchema: Schema = {
  memberId: {
    notEmpty: true,
    isString: true,
    errorMessage: "memberId must be a string and not empty",
  },
  adminId: {
    notEmpty: true,
    isString: true,
    errorMessage: "adminId must be a string and not empty",
  },
};

export const validationUpdateAddressBodySchema: Schema = {
  "address.house": {
    notEmpty: true,
    isString: true,
    errorMessage: "Address house must be a string and not empty",
  },
  "address.square": {
    notEmpty: true,
    isString: true,
    errorMessage: "Address square must be a string and not empty",
  },
};

export const validationUpdateClientBodySchema: Schema = {
  name: {
    notEmpty: false,
    optional: true,
    isString: true,
    errorMessage: "name must be a string and not empty",
  },
  password: {
    notEmpty: false,
    optional: true,
    isString: true,
    errorMessage: "password must be a string and not empty",
  },
  roleId: {
    notEmpty: false,
    optional: true,
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
  clientId: {
    notEmpty: false,
    optional: true,
    isString: true,
    errorMessage: "clientId must be a string",
  },
};

const clientRouter = Router();

clientRouter.post(
  "/clients",
  validationAdminAccessToken,
  addRoleIdAtBody,
  checkExact(
    [
      checkSchema(validationCreateClientBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param([], "Router parameters unpermitted"), // check if has any router parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationParams,
  createClientController
);

clientRouter.delete(
  "/clients/:userId",
  checkExact([
    body([], "Body parameters unpermitted"),
    query([], "Query parameters unpermitted"),
    param(["userId"], "Router parameters unpermitted"),
  ]),
  validationParams,
  validationAdminOrClientAccessToken,
  addRoleIdAtBody,
  validationUserOwnId,
  deleteUserController
);

clientRouter.put(
  "/clients/:id/change-address",
  checkExact(
    [
      checkSchema(validationUpdateAddressBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param(["id"], 'The "id" parameter is required'), // check if 'id' is present in the route parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationParams,
  validationIfAddressAlreadyExists,
  validationAdminOrClientAccessToken,
  validationIfIdRouterClient,
  updateAddressController
);

clientRouter.put(
  "/clients/swap/:id",
  validationAdminAccessToken,
  checkExact(
    [
      checkSchema(validationSwapClientBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param(["id"], 'The "id" parameter is required'), // check if 'id' is present in the route parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationParams,
  validationMemberBelongsToClient,
  swapClientController
);

clientRouter.put(
  "/:userId/clients/:id",
  validationAdminOrClientAccessToken,
  clientBelongsToUser,
  validationUserOwnId,
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
  updateBodyClient,
  updateClientController
);

clientRouter.get(
  "/:userId/clients/:id",
  validationAdminOrClientAccessToken,
  validationUserOwnId,
  addIncludesClientAndRoleAtBody,
  getUserController
);

clientRouter.get(
  "/clients",
  validationAdminAccessToken,
  validationQueryParams,
  addIncludesClientAtQuery,
  listUserController
);

export { clientRouter };
