import { Role, User } from "@prisma/client";
import { findClient } from "@repositories/user/client";
import { badRequest } from "@serializer/erros/400";
import { unauthorized } from "@serializer/erros/401";
import { NextFunction, Request, Response } from "express";
import { VerifyErrors, verify } from "jsonwebtoken";

export const validationIfIdRouterClient = async (
  req: Request<
    { id: string },
    {},
    { address: { house: string; square: string } },
    qs.ParsedQs
  >,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const { authorization } = req.headers;

    if (!authorization) return unauthorized(res, "Authorization is missing");

    const accessToken = authorization.split("Bearer ")[1];

    if (!accessToken) return unauthorized(res, "Access token is missing");

    const userClient = await findClient({ id });

    const user = await new Promise<User & { role: Role }>((resolve, reject) => {
      return verify(
        accessToken,
        process.env.TOKEN_SECRET,
        async (err: VerifyErrors, decoded: User & { role: Role }) => {
          if (err) return reject(err);
          return resolve(decoded);
        }
      );
    });

    if (userClient.userId !== user.id && user.role.name === "CLIENT")
      return badRequest({ res, message: "Id mismatch in user authenticated" });

    return next();
  } catch (error) {
    return badRequest({
      res,
      message: "Error in validationIfIdRouterClient " + error.message,
    });
  }
};
