import { unauthorized } from "@serializer/erros/401";
import { prismaClient } from "@libs/prisma";
import { Role, User } from "@prisma/client";
import { getUser } from "@repositories/user";
import { NextFunction, Request, Response } from "express";
import { VerifyErrors, verify } from "jsonwebtoken";

export const validationAdminAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) return unauthorized(res, "No authorization required");

  const accessToken = authorization.split("Bearer ")[1];

  if (!accessToken) return unauthorized(res, "Format token required");

  try {
    const user = await new Promise<User & { role: Role }>((resolve, reject) => {
      return verify(
        accessToken,
        process.env.TOKEN_SECRET,
        async (err: VerifyErrors, decoded: User & { role: Role }) => {
          if (err) return reject(err);
          const userExists = await getUser({
            id: decoded.id,
          });
          if (!userExists) return reject("User does not exist");
          return resolve(decoded);
        }
      );
    });

    if (!user || user.role.name !== "ADMIN") {
      return unauthorized(res, "User haven't permission");
    }

    const admin = await prismaClient.admin.findFirstOrThrow({
      where: { userId: user.id },
    });

    res.locals.adminId = admin.id;
    return next();
  } catch (error) {
    return unauthorized(res);
  }
};
