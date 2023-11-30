import { createAdminController } from "@controllers/user/admin/create";
import { updateAdminController } from "@controllers/user/admin/update";
import { createUserController } from "@controllers/user/create";
import { getUserController } from "@controllers/user/get";
import { listUserController } from "@controllers/user/list";
import { updateUserController } from "@controllers/user/update";
import {
  validationParams,
  validationQueryParams,
} from "@middlewares/paramsRouter";
import { addIncludesAdminAndRoleAtBody } from "@middlewares/resources/user/admin/addIncludesAdminAndRoleAtBody";
import { addIncludesAdminAtQuery } from "@middlewares/resources/user/admin/addIncludesAdminAtQuery";
import { addRoleIdAtBody } from "@middlewares/resources/user/admin/addRoleIdAtBody";
import { updateBodyUser } from "@middlewares/resources/user/updateBody";
import { Router } from "express";
import {
  Schema,
  check,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";

const adminRouter = Router();

export const validationCreateAdminBodySchema: Schema = {
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
};

export const validationUpdateAdminBodySchema: Schema = {
  name: {
    notEmpty: false,
    optional: true,
    isString: true,
    errorMessage: "name must be a string",
  },
  password: {
    notEmpty: false,
    optional: true,
    isString: true,
    errorMessage: "password must be a string",
  },
  roleId: {
    notEmpty: false,
    optional: true,
    isString: true,
    errorMessage: "role must be a string",
  },
};

adminRouter.post(
  "/admins",
  addRoleIdAtBody,
  checkExact(
    [
      checkSchema(validationCreateAdminBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param([], "Query parameters unpermitted"), // check if has any router parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationParams,
  createUserController,
  createAdminController
);

adminRouter.put(
  "/:userId/admins/:id",
  checkExact(
    [
      checkSchema(validationUpdateAdminBodySchema, ["body"]),
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
  updateAdminController
);

adminRouter.get(
  "/:userId/admins/:id",
  addIncludesAdminAndRoleAtBody,
  getUserController
);

adminRouter.get(
  "/admins",
  validationQueryParams,
  addIncludesAdminAtQuery,
  listUserController
);

export { adminRouter };
