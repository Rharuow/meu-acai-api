import { listCreamController } from "@controllers/cream";
import { validationUserAccessToken } from "@middlewares/authorization/validationUserAccessToken";
import { validationQueryparams } from "@middlewares/resources/creams/queryParams";
import { NextFunction, Request, Response, Router } from "express";

const creamRouter = Router();

creamRouter.get(
  "/creams",
  validationUserAccessToken,
  validationQueryparams,
  listCreamController
);

export { creamRouter };
