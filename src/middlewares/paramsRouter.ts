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
    req.method === "PUT" &&
      errors.array().forEach((err) => {
        console.log("ERR = ", err);
      });
    return unprocessableEntity(res, errors);
  }
  return next();
};

export const validationQueryParams = (
  req: Request<{}, {}, {}, qs.ParsedQs & QueryParms>,
  res: Response,
  next: NextFunction
) => {
  const { page, perPage, orderBy } = req.query;

  // Set default values if not provided
  req.query.page = page ? Number(page) : 1;
  req.query.perPage = perPage ? Number(perPage) : 10;
  req.query.orderBy = orderBy ? String(orderBy) : "createdAt:asc";

  return next();
};
