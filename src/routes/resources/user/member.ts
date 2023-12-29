import {
  deleteManyUsersController,
  deleteUserController,
} from "@controllers/user/delete";
import { getUserController } from "@controllers/user/get";
import { listUserController } from "@controllers/user/list";
import { createMemberController } from "@controllers/user/member/create";
import { updateMemberController } from "@controllers/user/member/update";
import { addNextToBody } from "@middlewares/addNextToBody";
import { validationAdminOrClientAccessToken } from "@middlewares/authorization/validationAdminOrClientAccessToken";
import { validationAdminOrMemberAccessToken } from "@middlewares/authorization/validationAdminOrMemberAccessToken";
import { validationClientAccessToken } from "@middlewares/authorization/validationClientAccessToken";
import { validationUserAccessToken } from "@middlewares/authorization/validationUserAccessToken";
import { validationUserOwnId } from "@middlewares/authorization/validationUserOwnId";
import {
  validationParams,
  validationQueryParams,
} from "@middlewares/paramsRouter";
import { idsInQueryParams } from "@middlewares/resources/idsInQueryParams";
import { addIncludesMemberAndRoleAtBody } from "@middlewares/resources/user/member/addIncludesMemberAndRoleAtBody";
import { addIncludesMemberAtQuery } from "@middlewares/resources/user/member/addIncludesMemberAtQuery";
import { addRoleIdAtBody } from "@middlewares/resources/user/member/addRoleIdAtBody";
import { updateBodyMember } from "@middlewares/resources/user/member/updateBodyUser";
import { validationMembersIds } from "@middlewares/resources/user/member/validationMemberIds";
import { Router } from "express";
import {
  Schema,
  body,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";

export const validationCreateMemberBodySchema: Schema = {
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
  clientId: {
    notEmpty: true,
    isString: true,
    errorMessage: "clientId must be a string and not empty",
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
};

export const validationUpdateMemberBodySchema: Schema = {
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
  relationship: {
    notEmpty: false,
    optional: true,
    isString: true,
    errorMessage: "Relationship must be a string",
  },
};

const memberRouter = Router();

memberRouter.get(
  "/:userId/members/:id",
  validationUserAccessToken,
  addIncludesMemberAndRoleAtBody,
  getUserController
);

memberRouter.get(
  "/members",
  validationQueryParams,
  validationAdminOrClientAccessToken,
  addIncludesMemberAtQuery,
  listUserController
);

memberRouter.post(
  "/members",
  addRoleIdAtBody,
  validationAdminOrClientAccessToken,
  checkExact(
    [
      checkSchema(validationCreateMemberBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param([], "Query parameters unpermitted"), // check if has any router parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationParams,
  addNextToBody,
  createMemberController
);

memberRouter.put(
  "/:userId/members/:id",
  validationAdminOrMemberAccessToken,
  validationUserOwnId,
  checkExact(
    [
      checkSchema(validationUpdateMemberBodySchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param(["userId", "id"], 'The "id" and "userId" parameter is required'), // check if 'id' is present in the route parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  validationParams,
  updateBodyMember,
  updateMemberController
);

memberRouter.delete(
  "/members/member/:userId",
  validationAdminOrMemberAccessToken,
  checkExact([
    body([], "Body parameters unpermitted"),
    query([], "Query parameters unpermitted"),
    param(["userId"], "Router parameters unpermitted"),
  ]),
  validationParams,
  validationUserOwnId,
  deleteUserController
);

memberRouter.delete(
  "/members/deleteMany",
  idsInQueryParams,
  validationClientAccessToken,
  validationMembersIds,
  deleteManyUsersController
);

memberRouter.delete(
  "/members/:id",
  checkExact([
    body([], "Body parameters unpermitted"),
    query([], "Query parameters unpermitted"),
    param(["id"], "Router parameters unpermitted"),
  ]),
  validationParams,
  validationAdminOrClientAccessToken,
  deleteUserController
);

export { memberRouter };
