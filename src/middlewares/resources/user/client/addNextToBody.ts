import { NextFunction, Request, Response } from "express";

export const addNextToBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body.next = true;
  return next();
};
