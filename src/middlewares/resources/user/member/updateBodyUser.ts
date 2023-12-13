import { UpdateMemberRequestBody } from "@/types/user/member/updateRequestBody";
import { UpdateUserRequestBody } from "@/types/user/updateRequestBody";
import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const updateBodyMember = (
  req: Request<{}, {}, UpdateUserRequestBody & UpdateMemberRequestBody, {}>,
  res: Response,
  next: NextFunction
) => {
  const { name, password, roleId, email, phone, relationship } = req.body;
  if (!name && !password && !roleId && !email && !phone && !relationship)
    return badRequest({
      res,
      message: "At least one property must exist in the request body",
    });

  return next();
};
