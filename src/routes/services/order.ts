import { validationUserAccessToken } from "@middlewares/authorization/validationUserAccessToken";
import { createServiceOrder } from "@services/order";
import { Router } from "express";

const ordersRouter = Router();

ordersRouter.post(
  "/orders",
  /* validationUserAccessToken, */ createServiceOrder
);

export { ordersRouter };
