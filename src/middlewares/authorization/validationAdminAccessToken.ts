import { unauthorized } from "@/serializeres/erros/401";
import { prismaClient } from "@libs/prisma";
import { Role, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { VerifyErrors, verify } from "jsonwebtoken";

export const validationAdminAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization.split("Bearer ")[1];

  let status = 200;

  verify(
    accessToken,
    process.env.TOKEN_SECRET,
    async (err: VerifyErrors, user: User & { role: Role }) => {
      console.log(user);
      if (err || user.role.name !== "ADMIN") {
        console.log("err = ", err);
        status = 401;
        return err;
      }

      const admin = await prismaClient.admin.findFirstOrThrow({
        where: { userId: user.id },
      });

      req.headers["adminId"] = admin.id;
      return admin.id;
    }
  );

  return status === 200 ? next() : unauthorized(res);
};
