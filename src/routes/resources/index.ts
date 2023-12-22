import { Router } from "express";
import { creamRouter } from "./cream";
import { userRouter } from "./user";
import { toppingRouter } from "./topping";
import { productRouter } from "./product";

const resourcesRouter = Router();

resourcesRouter.use(
  "/resources",
  creamRouter,
  userRouter,
  toppingRouter,
  productRouter
);

export { resourcesRouter };
