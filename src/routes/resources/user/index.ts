import { validationAdminAccessToken } from "@/middlewares/authorization/validationAdminAccessToken";
import { Router } from "express";
import { adminRouter } from "./admin";

const userRouter = Router();

userRouter.use("/users", validationAdminAccessToken, adminRouter);

export { userRouter };
