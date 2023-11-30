import { getRoleByName } from "@repositories/role";
import { internalServerError } from "@serializer/erros/500";
import { NextFunction, Request, Response } from "express";

export const addRoleIdAtBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roleId = (await getRoleByName({ name: "CLIENT" })).id;

    req.body.roleId = roleId;

    return next();
  } catch (error) {
    return internalServerError(
      res,
      "Sorry, some error occurred while adding role"
    );
  }
};
