import { validationAdminAccessToken } from "@middlewares/authorization/validationAdminAccessToken";
import { Router } from "express";
import { adminRouter } from "./admin";
import {
  deleteManyUsersController,
  deleteUserController,
} from "@controllers/user/delete";
import { idsInQueryParams } from "@middlewares/resources/idsInQueryParams";
import { clientRouter } from "./client";

const userRouter = Router();

userRouter.use("/users", validationAdminAccessToken, adminRouter);

userRouter.use("/users", validationAdminAccessToken, clientRouter);

userRouter.delete(
  "/users/deleteMany",
  idsInQueryParams,
  validationAdminAccessToken,
  deleteManyUsersController
);

userRouter.delete(
  "/users/:id",
  validationAdminAccessToken,
  deleteUserController
);

export { userRouter };
