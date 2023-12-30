import { Router } from "express";
import { ordersRouter } from "./order";

const servicesRouter = Router();

servicesRouter.use("/services", ordersRouter);

export { servicesRouter };
