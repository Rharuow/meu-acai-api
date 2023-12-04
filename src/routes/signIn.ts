import "module-alias/register";
import { signInController } from "@controllers/signIn";
import { Router } from "express";
import {
  Schema,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";
import { validationUser } from "@middlewares/signIn";
import { validationParams } from "@middlewares/paramsRouter";

export const validationBodySignInSchema: Schema = {
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
};

const signInRouter = Router();

signInRouter.use(
  "/signin",
  // Middleware to check each launch request query parameters
  checkExact(
    [
      checkSchema(validationBodySignInSchema, ["body"]),
      query([], "Query parameters unpermitted"), // check if has any query parameters
      param([], "Query parameters unpermitted"), // check if has any router parameters
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  // Middleware to make validation of the previous step has some error
  validationParams,
  // Middleware to validation user in jwt request
  validationUser
);

signInRouter.post("/signin", signInController);

export { signInRouter };
