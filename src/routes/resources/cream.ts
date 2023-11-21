import { listCreamController } from "@controllers/cream";
import { Router } from "express";

const creamRouter = Router();

creamRouter.get("/creams", listCreamController);

export { creamRouter };
