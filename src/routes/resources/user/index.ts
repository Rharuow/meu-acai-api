import { validationAdminAccessToken } from "@middlewares/authorization/validationAdminAccessToken";
import { Router } from "express";
import { adminRouter } from "./admin";
import {
  deleteManyUsersController,
  deleteUserController,
} from "@controllers/user/delete";
import { idsInQueryParams } from "@middlewares/resources/idsInQueryParams";
import { clientRouter } from "./client";
import { validationAdminOrClientAccessToken } from "@middlewares/authorization/validationAdminOrClientAccessToken";
import { memberRouter } from "./member";

const userRouter = Router();

userRouter.use("/users", validationAdminAccessToken, adminRouter);

userRouter.use("/users", validationAdminAccessToken, clientRouter);

userRouter.use("/users", validationAdminOrClientAccessToken, memberRouter);

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
