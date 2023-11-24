import { Router } from "express";
import { creamRouter } from "./cream";

const resourcesRouter = Router();

resourcesRouter.use("/resources", creamRouter);

export { resourcesRouter };
