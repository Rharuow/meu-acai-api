import {
  createAdminController,
  createManyAdminsController,
} from "@controllers/user/admin/create";
import { updateAdminController } from "@controllers/user/admin/update";
import {
  createManyUserController,
  createUserController,
} from "@controllers/user/create";
import { getUserController } from "@controllers/user/get";
import { listUserController } from "@controllers/user/list";
import { updateUserController } from "@controllers/user/update";
import { validationQueryParams } from "@middlewares/paramsRouter";
import { addIncludesAdminAndRoleAtBody } from "@middlewares/resources/user/admin/addIncludesAdminAndRoleAtBody";
import { addIncludesAdminAtQuery } from "@middlewares/resources/user/admin/addIncludesAdminAtQuery";
import { addRoleIdAtBody } from "@middlewares/resources/user/admin/addRoleIdAtBody";
import { Router } from "express";

const adminRouter = Router();

adminRouter.post(
  "/admins",
  addRoleIdAtBody,
  createUserController,
  createAdminController
);

adminRouter.post(
  "/admins/createMany",
  addRoleIdAtBody,
  createManyUserController,
  createManyAdminsController
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

adminRouter.get(
  "/admins",
  validationQueryParams,
  addIncludesAdminAtQuery,
  listUserController
);

export { adminRouter };
