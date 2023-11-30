import { getRoleByName } from "@repositories/role";
import { internalServerError } from "@serializer/erros/500";
import { NextFunction, Request, Response } from "express";

export const addRoleIdAtBodyInArray = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roleId = (await getRoleByName({ name: "CLIENT" })).id;

    req.body = req.body.map(
      (
        client: Array<{
          name: string;
          password: string;
          address: { house: string; square: string };
          email?: string;
          phone?: string;
          roleId: string;
        }>
      ) => ({ ...client, roleId })
    );

    return next();
  } catch (error) {
    return internalServerError(
      res,
      "Sorry, some error occurred while adding role"
    );
  }
};
