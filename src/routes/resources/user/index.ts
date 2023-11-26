import { validationAdminAccessToken } from "@/middlewares/authorization/validationAdminAccessToken";
import { Router } from "express";
import { adminRouter } from "./admin";
import { deleteUserController } from "@/controllers/user/delete";

const userRouter = Router();

userRouter.use("/users", validationAdminAccessToken, adminRouter);

userRouter.delete(
  "/users/:id",
  validationAdminAccessToken,
  deleteUserController
);

export { userRouter };
