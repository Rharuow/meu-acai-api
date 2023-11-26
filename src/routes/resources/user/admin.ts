import { createAdminController } from "@/controllers/user/admin/create";
import { updateAdminController } from "@/controllers/user/admin/update";
import { createUserController } from "@/controllers/user/create";
import { getUserController } from "@/controllers/user/get";
import { updateUserController } from "@/controllers/user/update";
import { addIncludesAdminAndRoleAtBody } from "@/middlewares/resources/user/admin/addIncludesAdminAndRoleAtBody";
import { addRoleIdAtBody } from "@/middlewares/resources/user/admin/addRoleIdAtBody";
import { Router } from "express";

const adminRouter = Router();

adminRouter.post(
  "/admins",
  addRoleIdAtBody,
  createUserController,
  createAdminController
);

adminRouter.put(
  "/:userId/admins/:id",
  updateUserController,
  updateAdminController
);

adminRouter.get(
  "/:userId/admins/:id",
  addIncludesAdminAndRoleAtBody,
  getUserController
);

export { adminRouter };
