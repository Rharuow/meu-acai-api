import { badRequest } from "@/serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const idsInQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { ids } = req.query;

  if (!ids || !Array.isArray(ids)) {
    return badRequest({ res, message: "Invalid or missing IDs" });
  }

  return next();
};
