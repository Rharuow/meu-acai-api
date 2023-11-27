import { Router } from "express";
import { creamRouter } from "./cream";
import { userRouter } from "./user";

const resourcesRouter = Router();

resourcesRouter.use("/resources", creamRouter, userRouter);

export { resourcesRouter };
