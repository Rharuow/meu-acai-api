import { NextFunction, Request, Response } from "express";

export const addIncludesMemberAtQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.query.includes = "MEMBER";
  return next();
};
