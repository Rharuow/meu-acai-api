import { UpdateAdminRequestBody } from "@/types/user/admin/updateRequestBody";
import { UpdateUserRequestBody } from "@/types/user/updateRequestBody";
import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const updateBodyAdmin = (
  req: Request<
    {},
    {},
    UpdateAdminRequestBody &
      UpdateUserRequestBody & { admin?: UpdateAdminRequestBody },
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

  req.body.admin = {
    ...(email && { email }),
    ...(phone && { phone }),
  };

  return next();
};
