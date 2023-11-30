import { unauthorized } from "@serializer/erros/401";
import { Role, User } from "@prisma/client";
import { getUser, getUserByNameAndPassword } from "@repositories/user";
import { NextFunction, Request, Response } from "express";
import { VerifyErrors, verify } from "jsonwebtoken";

export const validationUserAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) return unauthorized(res);

    const accessToken = authorization.split("Bearer ")[1];

    if (!accessToken) return unauthorized(res);

    const user = await new Promise<User & { role: Role }>((resolve, reject) => {
      return verify(
        accessToken,
        process.env.TOKEN_SECRET,
        async (err: VerifyErrors, decoded: User & { role: Role }) => {
          if (err) return reject(err);
          const hasUser = await getUser({
            id: decoded.id,
          });
          if (!hasUser) return reject("User not found");
          return resolve(decoded);
        }
      );
    });

    if (!user) return unauthorized(res);

    return next();
  } catch (error) {
    return unauthorized(res);
  }
};
