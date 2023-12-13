import { prismaClient } from "@libs/prisma";

export const createClientRoleIfNotExist = async () => {
  const adminRole = await prismaClient.role.findFirst({
    where: { name: "CLIENT" },
  });

  if (!adminRole)
    return (
      await prismaClient.role.create({
        data: {
          name: "CLIENT",
        },
      })
    ).id;

  return adminRole.id;
};

export const cleanCreateClientRoleIfNotExist = async () => {
  await prismaClient.role.delete({ where: { name: "CLIENT" } });
};
