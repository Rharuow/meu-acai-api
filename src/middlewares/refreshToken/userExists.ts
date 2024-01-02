import { unauthorized } from "@serializer/erros/401";
import { User } from "@prisma/client";
import { getUser, getUserByNameAndPassword } from "@repositories/user";
import { NextFunction, Request, Response } from "express";
import { VerifyErrors, verify } from "jsonwebtoken";

export const userExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status = 200;
  if (!req.headers.accessToken) return unauthorized(res);
  verify(
    req.headers.authorization.split("Bearer ")[1],
    process.env.TOKEN_SECRET,
    async (err: VerifyErrors, user: User) => {
      const hasUser = await getUser({ id: user.id });
      if (!hasUser) status = 401;
    }
  );
  return status === 200 ? next() : unauthorized(res);
};
