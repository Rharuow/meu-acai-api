import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const idsInQueryParams = (
  req: Request<{}, {}, {}, qs.ParsedQs & { ids: string }>,
  res: Response,
  next: NextFunction
) => {
  const ids = req.query.ids.split(",");

  if (!ids || !Array.isArray(ids)) {
    console.log("error =", "IS NOT ARRAY");
    return badRequest({ res, message: "Invalid or missing IDs" });
  }

  req.query.usersIds = ids;

  return next();
};
