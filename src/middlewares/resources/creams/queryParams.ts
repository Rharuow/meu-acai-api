import { QueryParms } from "@/types/queryParams/pagination";
import { NextFunction, Request, Response } from "express";

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
