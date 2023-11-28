import { NextFunction, Request, Response } from "express";

import { unprocessableEntity } from "@serializer/erros/422";
import { createManyUser, createUser } from "@repositories/user";
import { CreateUserRequestBody } from "@/types/user/createRequestbody";
import { prismaClient } from "@libs/prisma";
import { Prisma } from "@prisma/client";

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
    console.log(" create user controller = ", error);
    // Check if the error is due to a unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      console.error("Unique constraint violation:", error.message);
      const { clientVersion, ...errorSanitized } = error;
      // Handle the unique constraint violation error here
      return unprocessableEntity(res, {
        errorSanitized,
        message: `Unique constraint failed on the fields: ${errorSanitized.meta.target}`,
      });
    } else {
      // Handle other errors
      return unprocessableEntity(res, { message: error.message });
    }
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

    req.body.usersIds = createdResourceIds.map((user) => user.id);

    return next();
  } catch (error) {
    console.error("Error creating user = ", error);
    return unprocessableEntity(res);
  }
};
