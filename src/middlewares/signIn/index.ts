import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const validationQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  // If errors return 422, client didn't provide required or unpermitted values at query parameters
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  return next();
};
