import "module-alias/register";
import { signIn } from "@controllers/signIn";
import { Router } from "express";
import { checkExact, checkSchema } from "express-validator";
import { validationSignInSchema } from "./validation/signIn";
import { validationQueryParams } from "@middlewares/signIn";

const signInRouter = Router();

signInRouter.use(
  // Middleware to check each launch request query parameters
  checkExact(checkSchema(validationSignInSchema), {
    message: "Param not permitted",
  }),
  // Middleware to make validation of the previous step has some error
  (req, res, next) => validationQueryParams(req, res, next)
);

signInRouter.post("/signgin", signIn);

export { signInRouter };
