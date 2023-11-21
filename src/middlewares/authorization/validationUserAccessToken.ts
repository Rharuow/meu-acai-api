import { unauthorized } from "@/serializeres/erros/401";
import { User } from "@prisma/client";
import { getUser } from "@repositories/user";
import { NextFunction, Request, Response } from "express";
import { VerifyErrors, verify } from "jsonwebtoken";

export const validationUserAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) return unauthorized(res);

    const accessToken = authorization.split("Bearer ")[1];
    console.log("accessToken: " + authorization);

    if (!accessToken) return unauthorized(res);

    verify(
      accessToken,
      process.env.TOKEN_SECRET,
      async (err: VerifyErrors, user: User) => {
        if (err) throw new Error(err.name + err.inner + err.message);
        const hasUser = await getUser(user);
        if (!hasUser) throw new Error("User not found");
      }
    );

    return next();
  } catch (error) {
    console.log("Error at user authorization middleware = ", error);
    return unauthorized(res);
  }
};
