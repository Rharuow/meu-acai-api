import "module-alias/register";
import { signIn } from "@controllers/signIn";
import { Router } from "express";
import {
  Schema,
  checkExact,
  checkSchema,
  param,
  query,
} from "express-validator";
import { validationSignInParams } from "@middlewares/signIn";

export const validationBodySignInSchema: Schema = {
  username: {
    notEmpty: true,
    isString: true,
    errorMessage: "username must be a string and not empty",
  },
  password: {
    notEmpty: true,
    isString: true,
    errorMessage: "password must be a string and not empty",
  },
};

const signInRouter = Router();

signInRouter.use(
  // check if has query parameters
  // Middleware to check each launch request query parameters
  checkExact(
    [
      checkSchema(validationBodySignInSchema, ["body"]),
      query([], "Query parameters unpermitted"),
      param([], "Query parameters unpermitted"),
    ],
    {
      message: "Param(s) not permitted",
    }
  ),
  // Middleware to make validation of the previous step has some error
  (req, res, next) => validationSignInParams(req, res, next)
);

signInRouter.post("/signgin", signIn);

export { signInRouter };
