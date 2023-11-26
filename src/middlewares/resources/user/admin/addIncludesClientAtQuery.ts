import { NextFunction, Request, Response } from "express";

export const addIncludesAdminAtQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.query.includes = "CLIENT";
  return next();
};
