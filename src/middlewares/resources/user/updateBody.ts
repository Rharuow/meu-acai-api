import { UpdateUserRequestBody } from "@/types/user/updateRequestBody";
import { NextFunction, Request, Response } from "express";

export const updateBodyUser = (
  req: Request<
    {},
    {},
    UpdateUserRequestBody & { user?: UpdateUserRequestBody },
    {}
  >,
  res: Response,
  next: NextFunction
) => {
  const { name, password, roleId } = req.body;

  req.body.user = {
    ...(name && { name }),
    ...(password && { password }),
    ...(roleId && { roleId }),
  };

  return next();
};
