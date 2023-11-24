import { prismaClient } from "@libs/prisma";

export const createAdminRoleIfNotExist = async () => {
  const adminRole = await prismaClient.role.findFirst({
    where: { name: "ADMIN" },
  });

  if (!adminRole)
    return (
      await prismaClient.role.create({
        data: {
          name: "ADMIN",
        },
      })
    ).id;

  return adminRole.id;
};

export const cleanCreateAdminRoleIfNotExist = async () => {
  await prismaClient.role.delete({ where: { name: "ADMIN" } });
};
