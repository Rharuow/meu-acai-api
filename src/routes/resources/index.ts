import { Router } from "express";
import { creamRouter } from "./cream";
import { userRouter } from "./user";
import { toppingRouter } from "./topping";

const resourcesRouter = Router();

resourcesRouter.use("/resources", creamRouter, userRouter, toppingRouter);

export { resourcesRouter };
