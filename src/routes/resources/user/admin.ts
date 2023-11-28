import {
  createAdminController,
  createManyAdminsController,
} from "@controllers/user/admin/create";
import { updateAdminController } from "@controllers/user/admin/update";
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
import { addIncludesAdminAndRoleAtBody } from "@middlewares/resources/user/admin/addIncludesAdminAndRoleAtBody";
import { addIncludesAdminAtQuery } from "@middlewares/resources/user/admin/addIncludesAdminAtQuery";
import { addRoleIdAtBody } from "@middlewares/resources/user/admin/addRoleIdAtBody";
import { Router } from "express";
import {
  Schema,
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

adminRouter.post(
  "/admins/createMany",
  addRoleIdAtBody,
  createManyUserController,
  createManyAdminsController
);

adminRouter.put(
  "/:userId/admins/:id",
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
