import { validationAdminAccessToken } from "@/middlewares/authorization/validationAdminAccessToken";
import { Router } from "express";
import { adminRouter } from "./admin";
import {
  deleteManyUsersController,
  deleteUserController,
} from "@/controllers/user/delete";
import { idsInQueryParams } from "@/middlewares/resources/user/idsInQueryParams";

const userRouter = Router();

userRouter.use("/users", validationAdminAccessToken, adminRouter);

userRouter.delete(
  "/users/:id",
  validationAdminAccessToken,
  deleteUserController
);

userRouter.delete(
  "/users/deleteMany",
  idsInQueryParams,
  validationAdminAccessToken,
  deleteManyUsersController
);

export { userRouter };
