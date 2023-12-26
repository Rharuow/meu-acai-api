import { paramsCreamByOptions } from "@routes/resources/cream";
import { QueryParms } from "@/types/queryParams/pagination";
import { unprocessableEntity } from "@serializer/erros/422";
import { NextFunction, Request, Response } from "express";

export const validationFilterParams = (
  req: Request<{}, {}, {}, qs.ParsedQs & QueryParms>,
  res: Response,
  next: NextFunction
) => {
  const { filter } = req.query;
  if (filter) {
    const filterParams = filter.split(",").map((param) => param.split(":")[0]);
    if (
      !filterParams.every((param) =>
        (paramsCreamByOptions as unknown as Array<string>).includes(param)
      )
    )
      return unprocessableEntity(res, "Filter parameters not permitted");
  }
  return next();
};
