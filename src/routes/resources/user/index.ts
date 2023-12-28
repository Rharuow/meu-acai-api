import { validationAdminAccessToken } from "@middlewares/authorization/validationAdminAccessToken";
import { Router } from "express";
import { adminRouter } from "./admin";
import {
  deleteManyUsersController,
  deleteUserController,
} from "@controllers/user/delete";
import { idsInQueryParams } from "@middlewares/resources/idsInQueryParams";
import { clientRouter } from "./client";
import { memberRouter } from "./member";

const userRouter = Router();

userRouter.use("/users", memberRouter);

userRouter.use("/users", clientRouter);

userRouter.use("/users", validationAdminAccessToken, adminRouter);

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
