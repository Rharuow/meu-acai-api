import { CreateAddressRequestBody } from "@/types/address/createRequestBody";
import { CreateUserRequestBody } from "@/types/user/createRequestbody";
import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const validateCreateAddressBody = (
  req: Request<
    {},
    {},
    CreateAddressRequestBody & {
      user?: CreateUserRequestBody & CreateAddressRequestBody;
    },
    {}
  >,
  res: Response,
  next: NextFunction
) => {
  const { square, house } = req.body;

  if (!square || !house)
    return badRequest({ res, message: "Missing square or house param" });

  return next();
};
