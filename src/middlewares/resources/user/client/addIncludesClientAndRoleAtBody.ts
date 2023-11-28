import { NextFunction, Request, Response } from "express";

export const addIncludesClientAndRoleAtBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body.includes = ["Client", "Role"];
  return next();
};
