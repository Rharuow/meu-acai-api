import { CreateClientRequestBody } from "@/types/user/client/createRequestBody";
import { CreateUserRequestBody } from "@/types/user/createRequestbody";
import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const validateCreateClientBody = (
  req: Request<
    {},
    {},
    CreateUserRequestBody &
      CreateClientRequestBody & { user?: CreateUserRequestBody },
    {}
  >,
  res: Response,
  next: NextFunction
) => {
  const { userId, address } = req.body;
  if (!address || !userId)
    return badRequest({
      res,
      message: "At least one property must exist in the request body",
    });

  return next();
};
