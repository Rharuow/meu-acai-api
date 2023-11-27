import { prismaClient } from "@libs/prisma";
import { ROLE } from "@prisma/client";

export const getRoleByName = async ({ name }: { name: ROLE }) => {
  return await prismaClient.role.findFirst({ where: { name } });
};
