import { NextFunction, Request, Response } from "express";

export const validationQueryParams = (
  req: Request<{}, {}, {}, qs.ParsedQs & QueryParms>,
  res: Response,
  next: NextFunction
) => {
  const { page, perPage } = req.query;

  if (!page) req.query["page"] = 1;
  if (!perPage) req.query["perPage"] = 10;

  return next();
};
