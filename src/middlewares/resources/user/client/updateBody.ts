import { UpdateClientRequestBody } from "@/types/user/client/updateRequestBody";
import { UpdateUserRequestBody } from "@/types/user/updateRequestBody";
import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const updateBodyClient = async (
  req: Request<
    { id: string; userId: string },
    {},
    UpdateClientRequestBody & UpdateUserRequestBody,
    {}
  >,
  res: Response,
  next: NextFunction
) => {
  const { email, phone, name, password, roleId } = req.body;

  if (!email && !phone && !name && !password && !roleId)
    return badRequest({
      res,
      message: "At least one property must exist in the request body",
    });

  return next();
};
