import { prismaClient } from "@libs/prisma";
import { unauthorized } from "@serializer/erros/401";
import { NextFunction, Request, Response } from "express";

export const validationMembersIds = async (
  req: Request<{}, {}, { clientId: string }, qs.ParsedQs & { ids: string }>,
  res: Response,
  next: NextFunction
) => {
  const members = await prismaClient.user.findMany({
    where: {
      id: {
        in: req.query.resourceIds as Array<string>,
      },
    },
    include: {
      client: true,
      member: true,
      role: true,
    },
  });

  if (
    members.length <= 0 ||
    members.some((user) => user.member.clientId !== res.locals.clientId)
  )
    return unauthorized(res);

  return next();
};
