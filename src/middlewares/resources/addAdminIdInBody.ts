import { unauthorized } from "@serializer/erros/401";
import { NextFunction, Request, Response } from "express";

export const addAdminIdInBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.adminId = res.locals.adminId;
    return next();
  } catch (error) {
    return unauthorized(res);
  }
};
