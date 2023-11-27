import { NextFunction, Request, Response } from "express";

import { unprocessableEntity } from "@serializer/erros/422";
import { createManyUser, createUser } from "@repositories/user";
import { CreateUserRequestBody } from "@/types/user/createRequestbody";
import { prismaClient } from "@libs/prisma";

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, password, roleId } = req.body as CreateUserRequestBody;

  try {
    const user = await createUser({ name, password, roleId });

    req.body.user = user;

    return next();
  } catch (error) {
    console.error("Error creating user = ", error);
    return unprocessableEntity(res);
  }
};

export const createManyUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const users = req.body as Array<CreateUserRequestBody>;

  try {
    const usersCreated = await createManyUser(
      users.map((user) => ({
        ...user,
        roleId: req.body.roleId,
      }))
    );

    // Retrieve the IDs of the created resources
    const createdResourceIds =
      usersCreated.count > 0
        ? await prismaClient.user.findMany({
            where: {
              name: {
                in: users.map((user) => user.name),
              },
            },
            select: {
              id: true,
            },
          })
        : [];

    req.body.usersIds = createdResourceIds;

    return next();
  } catch (error) {
    console.error("Error creating user = ", error);
    return unprocessableEntity(res);
  }
};
