import { NextFunction, Request, Response } from "express";

export const addIncludesAdminAndRoleAtBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body.includes = ["Admin", "Role"];
  return next();
};
