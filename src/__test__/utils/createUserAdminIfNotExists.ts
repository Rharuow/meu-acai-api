import { prismaClient } from "@libs/prisma";
import { User } from "@prisma/client";

export const createUserAdminIfNotExists = async (user: User) => {
  const hasAdmin = await prismaClient.admin.findFirst({
    where: { userId: user.id },
  });

  if (!hasAdmin)
    return await prismaClient.admin.create({
      data: {
        userId: user.id,
      },
    });

  return hasAdmin;
};
