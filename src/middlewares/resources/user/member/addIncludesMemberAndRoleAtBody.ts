import { NextFunction, Request, Response } from "express";

export const addIncludesMemberAndRoleAtBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body.includes = ["Member", "Role"];
  return next();
};
