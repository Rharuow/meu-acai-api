import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, name, roleId } = req.body as User;
};
