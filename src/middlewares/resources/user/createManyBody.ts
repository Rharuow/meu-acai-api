import { CreateUserRequestBody } from "@/types/user/createRequestbody";
import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const createManyBodyUser = (
  req: Request<
    {},
    {},
    CreateUserRequestBody & { user?: CreateUserRequestBody },
    {}
  >,
  res: Response,
  next: NextFunction
) => {
  const { name, password, roleId } = req.body;
  if (!name && !password && !roleId)
    return badRequest({
      res,
      message: "At least one property must exist in the request body",
    });

  req.body.user = {
    ...(name && { name }),
    ...(password && { password }),
    ...(roleId && { roleId }),
  };

  return next();
};
