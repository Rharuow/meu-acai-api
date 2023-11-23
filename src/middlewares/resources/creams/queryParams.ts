import { NextFunction, Request, Response } from "express";

export const validationQueryParams = (
  req: Request<{}, {}, {}, qs.ParsedQs & QueryParms>,
  res: Response,
  next: NextFunction
) => {
  const { page, perPage } = req.query;

  // Set default values if not provided
  req.query.page = page ? Number(page) : 1;
  req.query.perPage = perPage ? Number(perPage) : 10;

  return next();
};
