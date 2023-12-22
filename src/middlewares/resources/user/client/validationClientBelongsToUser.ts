import { Client, User } from "@prisma/client";
import { getUser } from "@repositories/user";
import { unprocessableEntity } from "@serializer/erros/422";
import { NextFunction, Request, Response } from "express";

export const clientBelongsToUser = async (
  req: Request<{ id: string; userId: string }, {}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  const { id, userId } = req.params;

  const userClient = (await getUser({
    id: userId,
    includes: ["Client"],
  })) as User & { client: Client };

  if (userClient && userClient.client.id !== id)
    return unprocessableEntity(res, "Client not belongs to user");

  return next();
};
