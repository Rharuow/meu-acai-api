import { unauthorized } from "@serializer/erros/401";
import { Role, User } from "@prisma/client";
import { ParamsUser, getUser } from "@repositories/user";
import { NextFunction, Request, Response } from "express";
import { VerifyErrors, verify } from "jsonwebtoken";

export const validationUserAccessToken = async (
  req: Request<{}, {}, {}, qs.ParsedQs & ParamsUser>,
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

    // if (user.role.name === "CLIENT") {
    //   req.query.includeNested = {
    //     role: true,
    //     client: {
    //       include: {
    //         members: true,
    //       },
    //     },
    //     member: true,
    //   };
    //   req.query.filter = `${
    //     req.query.filter ? req.query.filter + `,id:${user.id}` : `id:${user.id}`
    //   }`;

    //   console.log(req.query);
    // }

    return next();
  } catch (error) {
    return unauthorized(res);
  }
};
