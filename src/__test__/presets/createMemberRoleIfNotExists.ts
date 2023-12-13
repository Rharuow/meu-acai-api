import { prismaClient } from "@libs/prisma";

export const createMemberRoleIfNotExist = async () => {
  const adminRole = await prismaClient.role.findFirst({
    where: { name: "MEMBER" },
  });

  if (!adminRole)
    return (
      await prismaClient.role.create({
        data: {
          name: "MEMBER",
        },
      })
    ).id;

  return adminRole.id;
};

export const cleanCreateMemberRoleIfNotExist = async () => {
  await prismaClient.role.delete({ where: { name: "MEMBER" } });
};
