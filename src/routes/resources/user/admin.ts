import { createAdminController } from "@/controllers/user/admin/create";
import { createUserController } from "@/controllers/user/create";
import { addRoleIdAtBody } from "@/middlewares/resources/user/admin/addRoleIdAtBody";
import { Router } from "express";

const adminRouter = Router();

adminRouter.post(
  "/admins",
  addRoleIdAtBody,
  createUserController,
  createAdminController
);

export { adminRouter };
