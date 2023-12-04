import { prismaClient } from "@libs/prisma";
import { User } from "@prisma/client";

export const createUserAdminIfNotExists = async (user: User) => {
  const hasAdmin = await prismaClient.admin.findFirst({
    where: { userId: user.id },
  });

  if (!hasAdmin) {
    const admin = await prismaClient.admin.create({
      data: {
        userId: user.id,
      },
    });
    await prismaClient.user.update({
      data: {
        adminId: admin.id,
      },
      where: {
        id: user.id,
      },
    });
  }

  return hasAdmin;
};
