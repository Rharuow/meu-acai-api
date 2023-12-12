import { UpdateClientRequestBody } from "@/types/user/client/updateRequestBody";
import { UpdateUserRequestBody } from "@/types/user/updateRequestBody";
import { Role, User } from "@prisma/client";
import { getUser } from "@repositories/user";
import { unauthorized } from "@serializer/erros/401";
import { NextFunction, Request, Response } from "express";
import { VerifyErrors, verify } from "jsonwebtoken";

export const validationUserOwnId = async (
  req: Request<
    { id: string; userId: string },
    {},
    UpdateUserRequestBody & UpdateClientRequestBody,
    qs.ParsedQs
  >,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) return unauthorized(res);

  const accessToken = authorization.split("Bearer ")[1];

  if (!accessToken) return unauthorized(res);

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

    if (!user)
      return unauthorized(res, "There is no user that can be authenticated.");

    if (
      req.params.userId &&
      user.role.name !== "ADMIN" &&
      req.params.userId !== user.id
    ) {
      return unauthorized(res, "The ID does not belong to the logged-in user");
    }

    return next();
  } catch (error) {
    return unauthorized(res);
  }
};
