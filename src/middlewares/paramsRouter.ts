import { unprocessableEntity } from "@serializer/erros/422";
import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";

export const validationParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  // If errors return 422, client didn't provide required or unpermitted values at query parameters
  if (!errors.isEmpty()) {
    console.log("errors = ", errors);
    return unprocessableEntity(res, errors);
  }
  return next();
};
