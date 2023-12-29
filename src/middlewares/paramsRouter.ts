import { QueryParms } from "@/types/queryParams/pagination";
import { unprocessableEntity } from "@serializer/erros/422";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const validationParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  // If errors return 422, client didn't provide required or unpermitted values at query parameters
  if (!errors.isEmpty()) {
    const error = errors.array().shift().msg;
    return unprocessableEntity(res, error);
  }
  return next();
};

export const validationQueryParams = (
  req: Request<{}, {}, {}, qs.ParsedQs & QueryParms>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  // If errors return 422, client didn't provide required or unpermitted values at query parameters
  if (!errors.isEmpty()) {
    const error = errors.array().shift().msg;
    return unprocessableEntity(res, error);
  }

  const { page, perPage, orderBy } = req.query;

  if (page < 0 || perPage < 0)
    return unprocessableEntity(res, "invalid parameters");

  // Set default values if not provided
  req.query.page = page ? Number(page) : 1;
  req.query.perPage = perPage ? Number(perPage) : 10;
  req.query.orderBy = orderBy ? String(orderBy) : "createdAt:asc";

  return next();
};
