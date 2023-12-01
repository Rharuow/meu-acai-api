import { createUserController } from "@controllers/user/create";
import { createMemberController } from "@controllers/user/member/create";
import { addNextToBody } from "@middlewares/addNextToBody";
import { validationParams } from "@middlewares/paramsRouter";
import { addRoleIdAtBody } from "@middlewares/resources/user/member/addRoleIdAtBody";
import { Router } from "express";
import {
  Schema,
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

const memberRouter = Router();

memberRouter.post(
  "/members",
  addRoleIdAtBody,
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
  createUserController,
  createMemberController
);

export { memberRouter };
