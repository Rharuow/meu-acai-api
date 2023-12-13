import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const idsInQueryParams = (
  req: Request<{}, {}, {}, qs.ParsedQs & { ids: string }>,
  res: Response,
  next: NextFunction
) => {
  if (!req.query.ids)
    return badRequest({ res, message: "Invalid or missing IDs" });

  const ids = req.query.ids.split(",");

  if (!ids || !Array.isArray(ids) || ids.length <= 0) {
    return badRequest({ res, message: "Invalid or missing IDs" });
  }

  req.query.resourceIds = ids;

  return next();
};
