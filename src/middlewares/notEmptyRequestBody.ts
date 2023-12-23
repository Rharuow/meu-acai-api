import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const notEmptyRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (Object.keys(req.body).length <= 0)
    return badRequest({ res, message: "At least one body" });
  return next();
};
